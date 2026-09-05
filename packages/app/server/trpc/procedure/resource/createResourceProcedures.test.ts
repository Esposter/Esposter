import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { Clause } from "@esposter/azure";
import type { BlobDeletionEventGridData } from "@esposter/db-schema";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { Visual } from "#shared/models/dashboard/data/Visual";
import { getFilesDirectoryName } from "#shared/services/resource/getFilesDirectoryName";
import { waitForSynchronizedFunctions } from "#shared/util/function/getSynchronizedFunction";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, mockSessionOnce } from "@@/server/trpc/context.test";
import { dashboardRouter } from "@@/server/trpc/routers/dashboard";
import { getFirstEmit } from "@@/server/trpc/routers/getFirstEmit.test";
import { resourceRouter } from "@@/server/trpc/routers/resource";
import { sheetRouter } from "@@/server/trpc/routers/sheet";
import { webpageRouter } from "@@/server/trpc/routers/webpage";
import { AZURE_MAX_PAGE_SIZE, BinaryOperator, CompositeKeyPropertyNames, serializeClauses } from "@esposter/azure";
import { getBlobName, getTopNEntities } from "@esposter/db";
import {
  AzureContainer,
  AzureTable,
  DatabaseEntityType,
  resources,
  ResourceType,
  ResourceViewEntity,
} from "@esposter/db-schema";
import { InvalidOperationError, jsonDateParse, noop, NotFoundError, Operation, takeOne } from "@esposter/shared";
import {
  MockBlobClient,
  MockContainerDatabase,
  MockEventGridDatabase,
  MockRestError,
  MockTableClient,
  MockTableDatabase,
} from "azure-mock";
import { afterEach, assert, beforeAll, describe, expect, test, vi } from "vitest";

// The generic resource-procedure matrix is covered ONCE here (via a publishable representative type);
// Per-type router tests only assert their own wiring (correct ResourceType + content schema round-trip).
describe("createResourceProcedures", () => {
  let mockContext: Context;
  let dashboardCaller: DecorateRouterRecord<TRPCRouter["dashboard"]>;
  let resourceCaller: DecorateRouterRecord<TRPCRouter["resource"]>;
  // Dashboard is the publishable representative; Webpage is the FileAssets one
  let webpageCaller: DecorateRouterRecord<TRPCRouter["webpage"]>;
  const name = "name";
  const updatedName = "updatedName";
  const filename = "filename";
  const mimetype = "mimetype";
  const size = 1;

  beforeAll(async () => {
    mockContext = await createMockContext();
    dashboardCaller = createCallerFactory(dashboardRouter)(mockContext);
    resourceCaller = createCallerFactory(resourceRouter)(mockContext);
    webpageCaller = createCallerFactory(webpageRouter)(mockContext);
  });

  afterEach(async () => {
    MockContainerDatabase.clear();
    MockTableDatabase.clear();
    // Cascade removes any resourcePublications rows too
    await mockContext.db.delete(resources);
    vi.restoreAllMocks();
  });

  test("creates resource", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });

    expect(newResource.name).toBe(name);
    expect(newResource.type).toBe(ResourceType.Dashboard);
    expect(newResource.contentVersion).toBe(0);
  });

  test("reads resources with publication state", async () => {
    expect.hasAssertions();

    const { items: emptyItems } = await dashboardCaller.readResources();

    expect(emptyItems).toStrictEqual([]);

    const newResource = await dashboardCaller.createResource({ name });
    const { items: draftItems } = await dashboardCaller.readResources();

    expect(draftItems).toStrictEqual([{ ...newResource, publication: null }]);

    await dashboardCaller.saveResourceContent({ content: new Dashboard(), contentVersion: 0, id: newResource.id });
    await dashboardCaller.publishResource({ id: newResource.id });
    const { items: publishedItems } = await dashboardCaller.readResources();

    expect(publishedItems[0]?.publication?.publishVersion).toBe(1);
  });

  test("updates resource", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    const updatedResource = await dashboardCaller.updateResource({ id: newResource.id, name: updatedName });

    expect(updatedResource.name).toBe(updatedName);
  });

  test("fails update with wrong user", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    await mockSessionOnce(mockContext.db);

    await expect(
      dashboardCaller.updateResource({ id: newResource.id, name: updatedName }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("deletes resource", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    const deletedResource = await dashboardCaller.deleteResource({ id: newResource.id });

    expect(deletedResource.id).toBe(newResource.id);

    const { items } = await dashboardCaller.readResources();

    expect(items).toStrictEqual([]);
  });

  test("reads undefined content for new resource", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    const content = await dashboardCaller.readResourceContent({ id: newResource.id });

    expect(content).toBeUndefined();
  });

  test("saves and reads content", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    const dashboard = new Dashboard({ visuals: [new Visual()] });
    const updatedResource = await dashboardCaller.saveResourceContent({
      content: dashboard,
      contentVersion: newResource.contentVersion,
      id: newResource.id,
    });

    expect(updatedResource.contentVersion).toBe(1);

    const content = await dashboardCaller.readResourceContent({ id: newResource.id });

    expect(content).toStrictEqual(jsonDateParse(JSON.stringify(dashboard)));
  });

  test("emits saved content to other devices", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    const dashboard = new Dashboard({ visuals: [new Visual()] });
    // The mock session mints a fresh session id per call, so the subscription and the save
    // Naturally run as different devices — the same-device echo filter stays out of the way
    const onSaveResourceContent = await dashboardCaller.onSaveResourceContent({ id: newResource.id });
    const data = await getFirstEmit(
      () => onSaveResourceContent,
      () => dashboardCaller.saveResourceContent({ content: dashboard, contentVersion: 0, id: newResource.id }),
    );

    expect(data.id).toBe(newResource.id);
    expect(data.contentVersion).toBe(1);
    // The emitted content is the schema-parsed input, which materialises optional keys as
    // Undefined — serialising both sides compares what a client actually receives over the wire
    expect(jsonDateParse(JSON.stringify(data.content))).toStrictEqual(jsonDateParse(JSON.stringify(dashboard)));
  });

  test("fails save content with old content version", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    const dashboard = new Dashboard();
    await dashboardCaller.saveResourceContent({ content: dashboard, contentVersion: 0, id: newResource.id });

    await expect(
      dashboardCaller.saveResourceContent({ content: dashboard, contentVersion: 0, id: newResource.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${
        new InvalidOperationError(
          Operation.Update,
          DatabaseEntityType.Resource,
          "cannot save resource content with old content version",
        ).message
      }]`,
    );
  });

  test("fails save content with wrong user", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    await mockSessionOnce(mockContext.db);

    await expect(
      dashboardCaller.saveResourceContent({ content: new Dashboard(), contentVersion: 0, id: newResource.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("publishes and reads published content", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    const dashboard = new Dashboard({ visuals: [new Visual()] });
    await dashboardCaller.saveResourceContent({ content: dashboard, contentVersion: 0, id: newResource.id });
    const publication = await dashboardCaller.publishResource({ id: newResource.id });

    expect(publication.publishVersion).toBe(1);

    const publishedContent = await dashboardCaller.readPublishedResourceContent(newResource.id);

    expect(publishedContent.name).toBe(name);
    expect(publishedContent.content).toStrictEqual(jsonDateParse(JSON.stringify(dashboard)));
  });

  test("reads an older published version's content for the owner", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    const firstDashboard = new Dashboard({ visuals: [new Visual()] });
    await dashboardCaller.saveResourceContent({ content: firstDashboard, contentVersion: 0, id: newResource.id });
    await dashboardCaller.publishResource({ id: newResource.id });
    await dashboardCaller.saveResourceContent({ content: new Dashboard(), contentVersion: 1, id: newResource.id });
    await dashboardCaller.publishResource({ id: newResource.id });
    const firstVersion = await dashboardCaller.readPublishedVersionContent({ id: newResource.id, version: 1 });

    // The v1 snapshot survives republishing to v2, so the owner can still read it back
    expect(firstVersion.name).toBe(name);
    expect(firstVersion.content).toStrictEqual(jsonDateParse(JSON.stringify(firstDashboard)));
  });

  test("fails read published version content with wrong user", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    await mockSessionOnce(mockContext.db);

    await expect(
      dashboardCaller.readPublishedVersionContent({ id: newResource.id, version: 1 }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("bumps publish version on republish", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    await dashboardCaller.saveResourceContent({ content: new Dashboard(), contentVersion: 0, id: newResource.id });
    await dashboardCaller.publishResource({ id: newResource.id });
    const republication = await dashboardCaller.publishResource({ id: newResource.id });

    expect(republication.publishVersion).toBe(2);
  });

  test("reads publication state", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    const publication = await dashboardCaller.readResourcePublication({ id: newResource.id });

    expect(publication).toBeUndefined();

    await dashboardCaller.saveResourceContent({ content: new Dashboard(), contentVersion: 0, id: newResource.id });
    await dashboardCaller.publishResource({ id: newResource.id });

    expect((await dashboardCaller.readResourcePublication({ id: newResource.id }))?.publishVersion).toBe(1);
  });

  test("fails publish without content", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });

    await expect(dashboardCaller.publishResource({ id: newResource.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Update, name: Resource, cannot publish resource without content]`,
    );
  });

  test("unpublishes resource", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    await dashboardCaller.saveResourceContent({ content: new Dashboard(), contentVersion: 0, id: newResource.id });
    await dashboardCaller.publishResource({ id: newResource.id });
    await dashboardCaller.unpublishResource({ id: newResource.id });

    const publication = await dashboardCaller.readResourcePublication({ id: newResource.id });

    expect(publication).toBeUndefined();
    await expect(
      dashboardCaller.readPublishedResourceContent(newResource.id),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.ResourcePublication, newResource.id).message}]`,
    );
  });

  // A sweep is bounded at the instant it is decided, so one published for a resource that has nothing published
  // Takes whatever a concurrent first publish has just cloned — and a delete that removed no row leaves the
  // Version sequence untouched, so nothing downstream can tell it happened. The whole tail is gated the same
  // Way, so the unpublish notification is counted here too: it would report a state change that never happened
  test("publishes nothing when nothing was published", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    const publishedEventCount = MockEventGridDatabase.get("")?.length ?? 0;

    await dashboardCaller.unpublishResource({ id: newResource.id });

    expect(MockEventGridDatabase.get("")?.length ?? 0).toBe(publishedEventCount);
  });

  // The mock resolves with an empty body where the live `BlobClient.download()` rejects, so the rejection a
  // Swept snapshot raises is injected here
  test("fails read published content with a swept snapshot", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    await dashboardCaller.saveResourceContent({ content: new Dashboard(), contentVersion: 0, id: newResource.id });
    await dashboardCaller.publishResource({ id: newResource.id });
    vi.spyOn(MockBlobClient.prototype, "download").mockRejectedValue(
      new MockRestError("The specified blob does not exist.", 404),
    );

    await expect(
      dashboardCaller.readPublishedResourceContent(newResource.id),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Resource, newResource.id).message}]`,
    );
    await expect(
      dashboardCaller.readPublishedVersionContent({ id: newResource.id, version: 1 }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Resource, newResource.id).message}]`,
    );
  });

  test("fails read published content for unpublished resource", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });

    await expect(
      dashboardCaller.readPublishedResourceContent(newResource.id),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.ResourcePublication, newResource.id).message}]`,
    );
  });

  test("omits publish procedures for non-publishable types", () => {
    expect.hasAssertions();

    // A non-publishable type (Table) has no publish endpoints at all — capability gating, not just a guard.
    // The dashboardCaller proxy is permissive at runtime, so absence is asserted on the router's procedure record.
    const publishableProcedures = Object.keys(dashboardRouter._def.procedures);
    const nonPublishableProcedures = Object.keys(sheetRouter._def.procedures);

    expect(publishableProcedures).toContain("publishResource");
    expect(nonPublishableProcedures).not.toContain("publishResource");
    expect(nonPublishableProcedures).not.toContain("unpublishResource");
    expect(nonPublishableProcedures).not.toContain("readResourcePublication");
    expect(nonPublishableProcedures).not.toContain("readPublishedResourceContent");
    expect(publishableProcedures).toContain("readPublishedVersionContent");
    expect(nonPublishableProcedures).not.toContain("readPublishedVersionContent");
    // View counting rides the publishable capability, so it is gated by the same seam
    expect(publishableProcedures).toContain("readResourceViewCount");
    expect(nonPublishableProcedures).not.toContain("readResourceViewCount");
  });

  test("counts each public read", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    await dashboardCaller.saveResourceContent({ content: new Dashboard(), contentVersion: 0, id: newResource.id });
    await dashboardCaller.publishResource({ id: newResource.id });
    const initialViewCount = await dashboardCaller.readResourceViewCount({ id: newResource.id });

    expect(initialViewCount).toBe(0);

    await dashboardCaller.readPublishedResourceContent(newResource.id);
    await dashboardCaller.readPublishedResourceContent(newResource.id);
    await waitForSynchronizedFunctions();
    const viewCount = await dashboardCaller.readResourceViewCount({ id: newResource.id });

    // One person refreshing counts twice — these are views, never visitors
    expect(viewCount).toBe(2);
  });

  test("counts no views for unpublished resources", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });

    await expect(
      dashboardCaller.readPublishedResourceContent(newResource.id),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.ResourcePublication, newResource.id).message}]`,
    );

    const viewCount = await dashboardCaller.readResourceViewCount({ id: newResource.id });

    expect(viewCount).toBe(0);
  });

  test("serves the public read when the view counter fails", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    const dashboard = new Dashboard();
    await dashboardCaller.saveResourceContent({ content: dashboard, contentVersion: 0, id: newResource.id });
    await dashboardCaller.publishResource({ id: newResource.id });
    // The table client is constructed per call, so the failure is injected on the prototype.
    // The counter inserts the day's first view and merges every one after it — never upserts, because
    // Two concurrent first views would both merge count: 1 and drop an increment
    vi.spyOn(MockTableClient.prototype, "createEntity").mockRejectedValue(new Error("Table write failed"));
    vi.spyOn(MockTableClient.prototype, "updateEntity").mockRejectedValue(new Error("Table write failed"));
    vi.spyOn(console, "error").mockImplementation(noop);
    const { content } = await dashboardCaller.readPublishedResourceContent(newResource.id);
    await waitForSynchronizedFunctions();

    // Telemetry must never break serving the page
    expect(content).toStrictEqual(jsonDateParse(JSON.stringify(dashboard)));
    await expect(dashboardCaller.readResourceViewCount({ id: newResource.id })).resolves.toBe(0);
  });

  test("purges view counts with the resource", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    await dashboardCaller.saveResourceContent({ content: new Dashboard(), contentVersion: 0, id: newResource.id });
    await dashboardCaller.publishResource({ id: newResource.id });
    await dashboardCaller.readPublishedResourceContent(newResource.id);
    // Drained here so the view write can never land after the purge sweep below
    await waitForSynchronizedFunctions();
    // Delete is soft, so view history survives the Recycle bin window — purge is what sweeps it
    await dashboardCaller.deleteResource({ id: newResource.id });
    await resourceCaller.purgeResource({ id: newResource.id });
    // The resource row is gone, so the cleared partition can only be observed against the table
    const clauses: Clause<ResourceViewEntity>[] = [
      { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: newResource.id },
    ];
    const resourceViewClient = await useTableClient(AzureTable.ResourceViews);
    const resourceViews = await getTopNEntities(resourceViewClient, AZURE_MAX_PAGE_SIZE, ResourceViewEntity, {
      filter: serializeClauses(clauses),
    });

    expect(resourceViews).toStrictEqual([]);
  });

  test("generates upload file sas entities", async () => {
    expect.hasAssertions();

    const newResource = await webpageCaller.createResource({ name });
    const sasEntities = await webpageCaller.generateUploadFileSasEntities({
      files: [{ filename, mimetype, size }],
      id: newResource.id,
    });

    expect(sasEntities).toHaveLength(1);
  });

  test("fails generate upload file sas entities with wrong user", async () => {
    expect.hasAssertions();

    const newResource = await webpageCaller.createResource({ name });
    await mockSessionOnce(mockContext.db);

    await expect(
      webpageCaller.generateUploadFileSasEntities({ files: [{ filename, mimetype, size }], id: newResource.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("publishes file deletion", async () => {
    expect.hasAssertions();

    const newResource = await webpageCaller.createResource({ name });
    // The input path is relative to the files directory — the server anchors it under {id}/files/
    const blobPath = getBlobName(crypto.randomUUID(), filename);
    const blobName = `${getFilesDirectoryName(newResource.id)}/${blobPath}`;
    MockContainerDatabase.set(AzureContainer.ResourceAssets, new Map([[blobName, Buffer.alloc(1)]]));

    await webpageCaller.deleteFile({ blobPath, id: newResource.id });
    const blobDeletionEvents = MockEventGridDatabase.get("");
    assert.exists(blobDeletionEvents);

    // The delete rides the one durable deletion publish, so the blob outlives the mutation and the handler
    // Removes it (/docs/architecture/blob-lifecycle)
    expect(takeOne(blobDeletionEvents, blobDeletionEvents.length - 1).data as BlobDeletionEventGridData).toStrictEqual({
      blobNames: [blobName],
      containerName: AzureContainer.ResourceAssets,
    });
    expect(MockContainerDatabase.get(AzureContainer.ResourceAssets)?.has(blobName)).toBe(true);
  });

  test("rejects a file path that climbs out of the files directory", async () => {
    expect.hasAssertions();

    const newResource = await webpageCaller.createResource({ name });

    await expect(
      webpageCaller.deleteFile({ blobPath: `../../${crypto.randomUUID()}/content.json`, id: newResource.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [TRPCError: [
        {
          "origin": "string",
          "code": "invalid_format",
          "format": "regex",
          "pattern": "/^(?!\\\\.{1,2}$)[^/\\\\\\\\]+$/u",
          "path": [
            "blobPath"
          ],
          "message": "Invalid string: must match pattern /^(?!\\\\.{1,2}$)[^/\\\\\\\\]+$/u"
        }
      ]]
    `);
  });

  test("omits file asset procedures for types without the capability", () => {
    expect.hasAssertions();

    const fileAssetsProcedures = Object.keys(webpageRouter._def.procedures);
    const nonFileAssetsProcedures = Object.keys(dashboardRouter._def.procedures);

    expect(fileAssetsProcedures).toContain("generateUploadFileSasEntities");
    expect(nonFileAssetsProcedures).not.toContain("generateUploadFileSasEntities");
    expect(nonFileAssetsProcedures).not.toContain("deleteFile");
  });
});
