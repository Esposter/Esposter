import type { TRPCRouter } from "#server/trpc/routers";
import type { R2Bucket } from "@cloudflare/workers-types";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { transformPublishedEmail } from "#server/services/emailEditor/transformPublishedEmail";
import { incrementResourceViewCount } from "#server/services/resource/incrementResourceViewCount";
import { mockBuckets } from "#server/services/storage/getBucket.test";
import { createCallerFactory } from "#server/trpc";
import { getMockSession } from "#server/trpc/context.test";
import { trpcRouter } from "#server/trpc/routers";
import { emailRouter } from "#server/trpc/routers/email";
import { setupResourceSuite } from "#server/trpc/routers/setupResourceSuite.test";
import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { EmailEditor } from "#shared/models/emailEditor/data/EmailEditor";
import { TEST_LABEL } from "#shared/services/pageBuilder/constants.test";
import { listBlobNames } from "@esposter/db";
import { createMockBucket } from "@esposter/db-mock";
import {
  resourceActivitiesInResource,
  ResourceType,
  resourceViewsInResource,
  StorageBucket,
  storageLedgerInStorage,
} from "@esposter/db-schema";
import { jsonDateParse } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { MjmlNodeType } from "mjml-blocks";
import { v7 } from "uuid";
import { afterAll, assert, beforeAll, describe, expect, test } from "vitest";

describe("emailRouter", () => {
  const { getCaller, getMockContext } = setupResourceSuite(emailRouter);
  let caller: DecorateRouterRecord<TRPCRouter["email"]>;
  let resourceCaller: DecorateRouterRecord<TRPCRouter["resource"]>;
  let bucket: R2Bucket;
  let dispose: () => Promise<void>;
  const name = "name";
  const html = "html";

  const readStorageBytesUsed = async (userId: string) =>
    (
      await getMockContext().db.query.usersInAuth.findFirst({
        columns: { storageBytesUsed: true },
        where: { id: { eq: userId } },
      })
    )?.storageBytesUsed;

  beforeAll(async () => {
    ({ bucket, dispose } = await createMockBucket(StorageBucket.ResourceAssets));
    mockBuckets[StorageBucket.ResourceAssets] = bucket;
    caller = getCaller();
    resourceCaller = createCallerFactory(trpcRouter)(getMockContext()).resource;
  });

  afterAll(async () => {
    await dispose();
  });

  test("saves and reads content", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });

    expect(newResource.type).toBe(ResourceType.Email);

    // The dataset binding and the save-time compiled html are part of the round-trip
    // So the schema provably preserves them
    const emailEditor = new EmailEditor({
      datasetReference: { id: v7(), type: DatasetProviderType.SurveyResponses },
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
      content: new EmailEditor({ datasetReference: { id: v7(), type: DatasetProviderType.SurveyResponses }, html }),
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });
    await caller.publishResource({ id: newResource.id });
    const publishedContent = await caller.readPublishedResourceContent(newResource.id);

    expect(publishedContent.content.datasetReference).toBeUndefined();
  });

  test("a valid email publishes its compiled HTML", async () => {
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

  test("an email with invalid markup is refused at publish", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    // The save path refuses a five-value padding by its schema before publish ever sees it, and no value the schema
    // Admits is refused by the validator, so the publish transform is run on the working copy directly
    const invalidEmail = new EmailEditor({
      content: [
        {
          props: {
            children: [
              {
                props: {
                  children: [
                    {
                      props: { content: TEST_LABEL, id: v7(), padding: "1px 2px 3px 4px 5px" },
                      type: MjmlNodeType.Button,
                    },
                  ],
                  id: v7(),
                },
                type: MjmlNodeType.Column,
              },
            ],
            id: v7(),
          },
          type: MjmlNodeType.Section,
        },
      ],
      root: { props: {} },
    });

    await expect(
      transformPublishedEmail({ ...getMockContext(), getSessionPayload: getMockSession() }, newResource, invalidEmail),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [TRPCError: Invalid operation: Update, name: Resource, ValidationError: 
       Line undefined of undefined (mj-button) — Attribute padding has invalid value: 1px 2px 3px 4px 5px for type Unit, only accepts (px, %) units and 1 to 4 value(s)]
    `);
  });

  test("a personalised export runs with the editor closed", async () => {
    expect.hasAssertions();

    const newResource = await caller.createResource({ name });
    const datasetReference = { id: v7(), type: DatasetProviderType.SurveyResponses };
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

  test("editing the preview text updates the compiled email", async () => {
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
    const readResourceBlobNames = () => listBlobNames(bucket, `${newResource.id}/`);
    const storedBlobNamesBeforePurge = await readResourceBlobNames();
    // The rows keyed by this email, each read before the purge so it is proved populated
    const readResourceActivities = () =>
      getMockContext()
        .db.select()
        .from(resourceActivitiesInResource)
        .where(eq(resourceActivitiesInResource.resourceId, newResource.id));
    const readResourceViews = () =>
      getMockContext()
        .db.select()
        .from(resourceViewsInResource)
        .where(eq(resourceViewsInResource.resourceId, newResource.id));
    const readLedgerEntries = async () =>
      (await getMockContext().db.select().from(storageLedgerInStorage)).filter(({ blobName }) =>
        blobName.startsWith(`${newResource.id}/`),
      );
    await incrementResourceViewCount(getMockContext().db, newResource.id);
    const activityBeforePurge = await readResourceActivities();
    const viewsBeforePurge = await readResourceViews();
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
    await expect(readResourceBlobNames()).resolves.toStrictEqual([]);
    // The resource row's delete cascades to both
    await expect(readResourceActivities()).resolves.toStrictEqual([]);
    await expect(readResourceViews()).resolves.toStrictEqual([]);
    await expect(readLedgerEntries()).resolves.toStrictEqual([]);
    await expect(readStorageBytesUsed(newResource.userId)).resolves.toBe(storageBytesUsedBeforePublish);
  });
});
