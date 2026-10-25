import type { TRPCRouter } from "#server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { transformPublishedEmail } from "#server/services/emailEditor/transformPublishedEmail";
import { incrementResourceViewCount } from "#server/services/resource/incrementResourceViewCount";
import { createCallerFactory } from "#server/trpc";
import { emailRouter } from "#server/trpc/routers/email";
import { resourceRouter } from "#server/trpc/routers/resource";
import { setupResourceSuite } from "#server/trpc/routers/setupResourceSuite.test";
import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { EmailEditor } from "#shared/models/emailEditor/data/EmailEditor";
import { TEST_LABEL } from "#shared/services/pageBuilder/constants.test";
import { AzureContainer, AzureTable, ResourceType, storageLedgerInStorage } from "@esposter/db-schema";
import { jsonDateParse } from "@esposter/shared";
import { MockContainerDatabase, MockTableDatabase } from "azure-mock";
import { MjmlNodeType } from "mjml-blocks";
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
  });

  test("A valid email publishes its compiled HTML", async () => {
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
    // The html the caller saved is replaced by the one the server compiles at publish
    expect(publishedContent.content.html).not.toBe(html);
    expect(publishedContent.content.html).toMatch(/^<!doctype html>/iu);
  });

  test("An email with invalid markup is refused at publish", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    // The save path refuses a five-value padding by its schema before publish ever sees it, and no value the schema
    // admits is refused by the validator, so the publish transform is run on the working copy directly
    const invalidEmail = new EmailEditor({
      content: [
        {
          props: {
            children: [
              {
                props: {
                  children: [
                    {
                      props: { content: TEST_LABEL, id: crypto.randomUUID(), padding: "1px 2px 3px 4px 5px" },
                      type: MjmlNodeType.Button,
                    },
                  ],
                  id: crypto.randomUUID(),
                },
                type: MjmlNodeType.Column,
              },
            ],
            id: crypto.randomUUID(),
          },
          type: MjmlNodeType.Section,
        },
      ],
      root: { props: {} },
    });

    await expect(transformPublishedEmail(getMockContext(), newResource, invalidEmail)).rejects
      .toThrowErrorMatchingInlineSnapshot(`
      [TRPCError: Invalid operation: Update, name: Resource, ValidationError: 
       Line undefined of undefined (mj-button) — Attribute padding has invalid value: 1px 2px 3px 4px 5px for type Unit, only accepts (px, %) units and 1 to 4 value(s)]
    `);
  });

  test("A personalised export runs with the editor closed", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    const datasetReference = { id: crypto.randomUUID(), type: DatasetProviderType.SurveyResponses };
    const preview = "Your order has shipped";
    const savedResource = await caller.saveResourceContent({
      content: new EmailEditor({ datasetReference, root: { props: { preview: name } } }),
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });
    // The second save is the latest edit, which the export compiles rather than the first
    await caller.saveResourceContent({
      content: new EmailEditor({ datasetReference, root: { props: { preview } } }),
      contentVersion: savedResource.contentVersion,
      id: newResource.id,
    });
    const exportedEmail = await caller.generateEmailHtml({ id: newResource.id });

    expect(exportedEmail.datasetReference).toStrictEqual(datasetReference);
    expect(exportedEmail.html).toContain(preview);
  });

  test("Editing the preview text updates the compiled email", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    const preview = "Your order has shipped";
    await caller.saveResourceContent({
      content: new EmailEditor({ html, root: { props: { preview } } }),
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });
    await caller.publishResource({ id: newResource.id });
    const publishedContent = await caller.readPublishedResourceContent(newResource.id);

    expect(publishedContent.content.html).toContain(preview);
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
