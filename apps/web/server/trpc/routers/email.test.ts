import type { TRPCRouter } from "#server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { incrementResourceViewCount } from "#server/services/resource/incrementResourceViewCount";
import { createCallerFactory } from "#server/trpc";
import { emailRouter } from "#server/trpc/routers/email";
import { resourceRouter } from "#server/trpc/routers/resource";
import { setupResourceSuite } from "#server/trpc/routers/setupResourceSuite.test";
import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { EmailEditor } from "#shared/models/emailEditor/data/EmailEditor";
import {
  AzureContainer,
  AzureTable,
  DatabaseEntityType,
  ResourceType,
  storageLedgerInStorage,
} from "@esposter/db-schema";
import { InvalidOperationError, jsonDateParse, Operation } from "@esposter/shared";
import { MockContainerDatabase, MockTableDatabase } from "azure-mock";
import { assert, beforeAll, describe, expect, test } from "vitest";

describe("emailRouter", () => {
  const { getCaller, getMockContext } = setupResourceSuite(emailRouter);
  let caller: DecorateRouterRecord<TRPCRouter["email"]>;
  let resourceCaller: DecorateRouterRecord<TRPCRouter["resource"]>;
  const name = "name";
  const html = "html";

  const readStorageBytesUsed = async (userId: string) =>
    (
      await getMockContext().db.query.usersInAuth.findFirst({
        columns: { storageBytesUsed: true },
        where: { id: { eq: userId } },
      })
    )?.storageBytesUsed;

  beforeAll(() => {
    caller = getCaller();
    resourceCaller = createCallerFactory(resourceRouter)(getMockContext());
  });

  test("saves and reads content", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });

    expect(newResource.type).toBe(ResourceType.Email);

    // The dataset binding and the save-time compiled html are part of the round-trip
    // So the schema provably preserves them
    const emailEditor = new EmailEditor({
      datasetReference: { id: crypto.randomUUID(), type: DatasetProviderType.SurveyResponses },
      html,
    });
    await caller.saveResourceContent({
      content: emailEditor,
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });
    const content = await caller.readResourceContent({ id: newResource.id });

    expect(content).toStrictEqual(jsonDateParse(JSON.stringify(emailEditor)));
  });

  test("rejects publishing an email without compiled html", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    await caller.saveResourceContent({
      content: new EmailEditor(),
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });

    await expect(caller.publishResource({ id: newResource.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Update, DatabaseEntityType.Resource, "cannot publish email without compiled html").message}]`,
    );
  });

  test("strips the owner-only dataset binding from the published snapshot", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    await caller.saveResourceContent({
      content: new EmailEditor({
        datasetReference: { id: crypto.randomUUID(), type: DatasetProviderType.SurveyResponses },
        html,
      }),
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });
    await caller.publishResource({ id: newResource.id });
    const publishedContent = await caller.readPublishedResourceContent(newResource.id);

    expect(publishedContent.content.datasetReference).toBeUndefined();
    expect(publishedContent.content.html).toBe(html);
  });

  test("serves the compiled html to the published web view", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    await caller.saveResourceContent({
      content: new EmailEditor({ html }),
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });
    await caller.publishResource({ id: newResource.id });
    const publishedContent = await caller.readPublishedResourceContent(newResource.id);

    expect(publishedContent.name).toBe(name);
    expect(publishedContent.content.html).toBe(html);
  });

  test("removing an email releases its stored files", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    const storageBytesUsedBeforePublish = await readStorageBytesUsed(newResource.userId);
    await caller.saveResourceContent({
      content: new EmailEditor({ html }),
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });
    await caller.publishResource({ id: newResource.id });
    const storageBytesUsedWhilePublished = await readStorageBytesUsed(newResource.userId);
    const container = MockContainerDatabase.get(AzureContainer.ResourceAssets);
    assert.exists(container);
    const readResourceBlobNames = () => [...container.keys()].filter((key) => key.startsWith(`${newResource.id}/`));
    const storedBlobNamesBeforePurge = readResourceBlobNames();
    // The partitions and ledger rows keyed by this email, each read before the purge so it is proved populated
    const readPartitionEntities = (tableName: AzureTable) =>
      [...(MockTableDatabase.get(tableName)?.values() ?? [])].filter(
        ({ partitionKey }) => partitionKey === newResource.id,
      );
    const readLedgerEntries = async () =>
      (await getMockContext().db.select().from(storageLedgerInStorage)).filter(({ blobName }) =>
        blobName.startsWith(`${newResource.id}/`),
      );
    await incrementResourceViewCount(newResource.id);
    const activityBeforePurge = readPartitionEntities(AzureTable.ResourceActivity);
    const viewsBeforePurge = readPartitionEntities(AzureTable.ResourceViews);
    const ledgerBeforePurge = await readLedgerEntries();
    // Deleting is soft, so the purge is what removes the directory and gives its bytes back
    await caller.deleteResource({ id: newResource.id });
    await resourceCaller.purgeResource({ id: newResource.id });

    assert.exists(storageBytesUsedBeforePublish);
    assert.exists(storageBytesUsedWhilePublished);
    expect(storageBytesUsedWhilePublished).toBeGreaterThan(storageBytesUsedBeforePublish);
    expect(storedBlobNamesBeforePurge).not.toStrictEqual([]);
    expect(activityBeforePurge).not.toStrictEqual([]);
    expect(viewsBeforePurge).not.toStrictEqual([]);
    expect(ledgerBeforePurge).not.toStrictEqual([]);
    expect(readResourceBlobNames()).toStrictEqual([]);
    expect(readPartitionEntities(AzureTable.ResourceActivity)).toStrictEqual([]);
    expect(readPartitionEntities(AzureTable.ResourceViews)).toStrictEqual([]);
    await expect(readLedgerEntries()).resolves.toStrictEqual([]);
    await expect(readStorageBytesUsed(newResource.userId)).resolves.toBe(storageBytesUsedBeforePublish);
  });
});
