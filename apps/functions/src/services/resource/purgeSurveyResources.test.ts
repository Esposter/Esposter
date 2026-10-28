import type { Database } from "@esposter/db-schema";

import { getContainerClient } from "#src/services/azure/getContainerClient";
import { getTableClient } from "#src/services/azure/getTableClient";
import { purgeSurveyResources } from "#src/services/resource/purgeSurveyResources";
import { createUser } from "#src/services/shared/createUser.test";
import { InvocationContext } from "@azure/functions";
import { getContentBlobName, readJsonBlob, writeJsonBlob } from "@esposter/db";
import { createMockDb } from "@esposter/db-mock";
import {
  AzureContainer,
  AzureTable,
  resourceLinksInResource,
  ResourceLinkType,
  resourcesInResource,
  ResourceType,
  storageLedgerInStorage,
  SurveyResponseEntity,
  usersInAuth,
} from "@esposter/db-schema";
import { jsonDateParse, takeOne } from "@esposter/shared";
import { MockBlockBlobClient, MockContainerDatabase, MockTableClient, MockTableDatabase } from "azure-mock";
import { eq } from "drizzle-orm";
import { afterEach, assert, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: Database;

vi.mock(import("#src/services/shared/db"), () => ({
  get db() {
    return mockDb;
  },
}));
vi.mock(import("#src/services/azure/getContainerClient"), () => import("#src/services/azure/getContainerClient.test"));
vi.mock(import("#src/services/azure/getTableClient"), () => import("#src/services/azure/getTableClient.test"));

// Released bytes are published to the owner's meter, so the group published to is the only observable of the broadcast
const { groupMock, sendToAllMock } = vi.hoisted(() => ({
  groupMock: vi.fn<(group: string) => void>(),
  sendToAllMock: vi.fn<(message: unknown) => Promise<void>>(),
}));

vi.mock(import("#src/services/azure/getWebPubSubServiceClient"), () => ({
  getWebPubSubServiceClient: () =>
    ({
      group: (group: string) => {
        groupMock(group);
        return { sendToAll: sendToAllMock };
      },
    }) as never,
}));

const writeContent = async (resourceId: string, document: object) => {
  const containerClient = await getContainerClient(AzureContainer.ResourceAssets);
  await writeJsonBlob(containerClient, getContentBlobName(resourceId), JSON.stringify(document));
};

const readContent = async (resourceId: string) => {
  const containerClient = await getContainerClient(AzureContainer.ResourceAssets);
  const serializedContent = await readJsonBlob(containerClient, getContentBlobName(resourceId));
  assert.exists(serializedContent);
  return jsonDateParse(serializedContent.toString());
};

const readBlobNames = () => [...(MockContainerDatabase.get(AzureContainer.ResourceAssets)?.keys() ?? [])];

const readSurveyResponseEntities = (surveyId: string) =>
  [...(MockTableDatabase.get(AzureTable.SurveyResponses)?.values() ?? [])].filter(
    ({ partitionKey }) => partitionKey === surveyId,
  );

const readLinkTargetIds = async (sourceId: string) =>
  (
    await mockDb
      .select({ targetId: resourceLinksInResource.targetId })
      .from(resourceLinksInResource)
      .where(eq(resourceLinksInResource.sourceId, sourceId))
  ).map(({ targetId }) => targetId);

describe(purgeSurveyResources, () => {
  const context = new InvocationContext({ logHandler: () => {} });
  const userId = crypto.randomUUID();
  const name = "name";
  const earlierDate = new Date(0);
  const laterDate = new Date(Temporal.Duration.from({ days: 1 }).total("milliseconds"));
  const countedBytes = 1;
  const textNode = { props: { id: "text" }, type: "Text" };

  beforeAll(async () => {
    mockDb = await createMockDb();
    await mockDb.insert(usersInAuth).values(createUser(userId));
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    MockContainerDatabase.clear();
    MockTableDatabase.clear();
    await mockDb.delete(resourcesInResource);
    await mockDb.delete(storageLedgerInStorage);
    await mockDb.update(usersInAuth).set({ storageBytesUsed: 0 });
  });

  const insertResource = async (type: ResourceType, createdAt: Date) =>
    takeOne(await mockDb.insert(resourcesInResource).values({ createdAt, name, type, userId }).returning());

  const inviteNodeId = "invite";
  const createInvite = (type: string, surveyId: string) => ({ props: { id: inviteNodeId, label: "", surveyId }, type });

  test("a purge removes a survey's blob directory, response partition, storage ledger entries and row, and broadcasts the owner whose bytes it released", async () => {
    expect.hasAssertions();

    const survey = await insertResource(ResourceType.Survey, earlierDate);
    await writeContent(survey.id, {});
    await mockDb
      .insert(storageLedgerInStorage)
      .values({
        blobName: getContentBlobName(survey.id),
        containerName: AzureContainer.ResourceAssets,
        countedBytes,
        declaredBytes: countedBytes,
        expiresAt: earlierDate,
        userId,
      });
    await mockDb.update(usersInAuth).set({ storageBytesUsed: countedBytes });
    const tableClient = await getTableClient(AzureTable.SurveyResponses);
    await tableClient.createEntity(new SurveyResponseEntity({ partitionKey: survey.id, rowKey: crypto.randomUUID() }));

    await purgeSurveyResources(context);

    expect(readBlobNames().filter((blobName) => blobName.startsWith(`${survey.id}/`))).toStrictEqual([]);
    expect(readSurveyResponseEntities(survey.id)).toStrictEqual([]);
    await expect(
      mockDb.select({ blobName: storageLedgerInStorage.blobName }).from(storageLedgerInStorage),
    ).resolves.toStrictEqual([]);
    expect(
      takeOne(await mockDb.select({ storageBytesUsed: usersInAuth.storageBytesUsed }).from(usersInAuth)),
    ).toStrictEqual({ storageBytesUsed: 0 });
    await expect(mockDb.select({ id: resourcesInResource.id }).from(resourcesInResource)).resolves.toStrictEqual([]);
    expect(groupMock).toHaveBeenCalledExactlyOnceWith(userId);
    expect(sendToAllMock).toHaveBeenCalledExactlyOnceWith({ userId });
  });

  test("a purge that fails leaves its row in place, and the survey after it still purges", async () => {
    expect.hasAssertions();

    // The earlier survey is the one the run reaches first, so the first partition read is its own
    const failingSurvey = await insertResource(ResourceType.Survey, earlierDate);
    await insertResource(ResourceType.Survey, laterDate);
    vi.spyOn(MockTableClient.prototype, "listEntities").mockImplementationOnce(() => {
      throw new Error(" ");
    });

    await purgeSurveyResources(context);

    await expect(mockDb.select({ id: resourcesInResource.id }).from(resourcesInResource)).resolves.toStrictEqual([
      { id: failingSurvey.id },
    ]);
  });

  test("a survey invite naming a purged survey is removed from a webpage and an email, and one naming a survey whose purge failed is kept", async () => {
    expect.hasAssertions();

    // The failing survey is the earlier one, so its partition read fails and its row, and the invites naming it, stay
    const failingSurvey = await insertResource(ResourceType.Survey, earlierDate);
    const purgedSurvey = await insertResource(ResourceType.Survey, laterDate);
    const webpage = await insertResource(ResourceType.Webpage, earlierDate);
    const email = await insertResource(ResourceType.Email, earlierDate);
    const program = await insertResource(ResourceType.Program, earlierDate);
    await writeContent(webpage.id, {
      content: [
        {
          props: { children: [createInvite("SurveyInvite", purgedSurvey.id), textNode], id: "section" },
          type: "Section",
        },
        createInvite("SurveyInvite", failingSurvey.id),
      ],
    });
    await writeContent(email.id, {
      content: [
        {
          props: {
            children: [
              {
                props: { children: [createInvite("survey-invite", purgedSurvey.id)], id: "column" },
                type: "mj-column",
              },
            ],
            id: "section",
          },
          type: "mj-section",
        },
      ],
    });
    await mockDb.insert(resourceLinksInResource).values([
      { sourceId: webpage.id, targetId: purgedSurvey.id, type: ResourceLinkType.Survey },
      { sourceId: webpage.id, targetId: failingSurvey.id, type: ResourceLinkType.Survey },
      { sourceId: email.id, targetId: purgedSurvey.id, type: ResourceLinkType.Survey },
      { sourceId: program.id, targetId: purgedSurvey.id, type: ResourceLinkType.Survey },
    ]);
    vi.spyOn(MockTableClient.prototype, "listEntities").mockImplementationOnce(() => {
      throw new Error(" ");
    });

    await purgeSurveyResources(context);

    await expect(readContent(webpage.id)).resolves.toStrictEqual({
      content: [
        { props: { children: [textNode], id: "section" }, type: "Section" },
        createInvite("SurveyInvite", failingSurvey.id),
      ],
    });
    await expect(readContent(email.id)).resolves.toStrictEqual({
      content: [
        {
          props: { children: [{ props: { children: [], id: "column" }, type: "mj-column" }], id: "section" },
          type: "mj-section",
        },
      ],
    });
    await expect(readLinkTargetIds(webpage.id)).resolves.toStrictEqual([failingSurvey.id]);
    await expect(readLinkTargetIds(email.id)).resolves.toStrictEqual([]);
    // A program is not a webpage or an email, so its survey link is left to the program
    await expect(readLinkTargetIds(program.id)).resolves.toStrictEqual([purgedSurvey.id]);
  });

  test("a webpage whose invite could not be removed keeps its survey link, and a rerun removes the invite", async () => {
    expect.hasAssertions();

    const purgedSurvey = await insertResource(ResourceType.Survey, earlierDate);
    const webpage = await insertResource(ResourceType.Webpage, earlierDate);
    await writeContent(webpage.id, { content: [createInvite("SurveyInvite", purgedSurvey.id)] });
    await mockDb
      .insert(resourceLinksInResource)
      .values({ sourceId: webpage.id, targetId: purgedSurvey.id, type: ResourceLinkType.Survey });
    vi.spyOn(MockBlockBlobClient.prototype, "upload").mockRejectedValueOnce(new Error(" "));

    await purgeSurveyResources(context);

    await expect(readLinkTargetIds(webpage.id)).resolves.toStrictEqual([purgedSurvey.id]);
    await expect(readContent(webpage.id)).resolves.toStrictEqual({
      content: [createInvite("SurveyInvite", purgedSurvey.id)],
    });

    await purgeSurveyResources(context);

    await expect(readLinkTargetIds(webpage.id)).resolves.toStrictEqual([]);
    await expect(readContent(webpage.id)).resolves.toStrictEqual({ content: [] });
  });
});
