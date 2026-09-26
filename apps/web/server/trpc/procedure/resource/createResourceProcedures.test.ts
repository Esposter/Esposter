import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { Clause } from "@esposter/azure";
import type { BlobDeletionEventGridData } from "@esposter/db-schema";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { Visual } from "#shared/models/dashboard/data/Visual";
import { MimeType } from "#shared/models/file/MimeType";
import {
  CONTENT_BASELINE_MISMATCH_ERROR_MESSAGE,
  MAX_RESOURCE_CONTENT_SIZE,
  STALE_CONTENT_VERSION_ERROR_MESSAGE,
} from "#shared/services/resource/constants";
import { getFilesDirectoryName } from "#shared/services/resource/getFilesDirectoryName";
import { waitForSynchronizedFunctions } from "#shared/util/function/getSynchronizedFunction";
import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { getStagingContentBlobName } from "@@/server/services/resource/getStagingContentBlobName";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, mockSessionOnce } from "@@/server/trpc/context.test";
import { createResourceProcedures } from "@@/server/trpc/procedure/resource/createResourceProcedures";
import { dashboardRouter } from "@@/server/trpc/routers/dashboard";
import { getFirstEmit } from "@@/server/trpc/routers/getFirstEmit.test";
import { resourceRouter } from "@@/server/trpc/routers/resource";
import { sheetRouter } from "@@/server/trpc/routers/sheet";
import { webpageRouter } from "@@/server/trpc/routers/webpage";
import { AZURE_MAX_PAGE_SIZE, BinaryOperator, CompositeKeyPropertyNames, serializeClauses } from "@esposter/azure";
import { getBlobName, getContentBlobName, getTopNEntities } from "@esposter/db";
import {
  AzureContainer,
  AzureFunction,
  AzureTable,
  DatabaseEntityType,
  resources,
  ResourceType,
  ResourceViewEntity,
  SnapshotChannel,
  storageLedger,
} from "@esposter/db-schema";
import { jsonDateParse, noop, NotFoundError, takeOne } from "@esposter/shared";
import {
  MockBlobClient,
  MockContainerDatabase,
  MockEventGridDatabase,
  MockRestError,
  MockTableClient,
  MockTableDatabase,
} from "azure-mock";
import { createHash } from "node:crypto";
import { gzipSync, zstdCompressSync } from "node:zlib";
import { afterEach, assert, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

// The generic resource-procedure matrix is covered ONCE here (via a publishable representative type);
// Per-type router tests only assert their own wiring (correct ResourceType + content schema round-trip).
describe(createResourceProcedures, () => {
  let mockContext: Context;
  let dashboardCaller: DecorateRouterRecord<TRPCRouter["dashboard"]>;
  let resourceCaller: DecorateRouterRecord<TRPCRouter["resource"]>;
  // Dashboard is the publishable representative; Webpage is the FileAssets one
  let webpageCaller: DecorateRouterRecord<TRPCRouter["webpage"]>;
  const name = "name";
  const updatedName = "updatedName";
  const filename = "filename";
  const mimetype = MimeType.Png;
  const size = 1;
  // Uploads a staged save the way the client does — through the write target its SAS query reserves — and hands
  // Back the hash its commit names
  const stageContent = async (id: string, compressedContent: Buffer) => {
    await dashboardCaller.generateUploadContentSasUrl({ id, size: compressedContent.byteLength });
    const containerClient = await useContainerClient(AzureContainer.ResourceAssets);
    await containerClient
      .getBlockBlobClient(getStagingContentBlobName(id))
      .upload(compressedContent, compressedContent.byteLength);
    return createHash("sha256").update(compressedContent).digest("hex");
  };

  beforeAll(async () => {
    mockContext = await createMockContext();
    dashboardCaller = createCallerFactory(dashboardRouter)(mockContext);
    resourceCaller = createCallerFactory(resourceRouter)(mockContext);
    webpageCaller = createCallerFactory(webpageRouter)(mockContext);
  });

  beforeEach(() => {
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
  });

  afterEach(async () => {
    vi.useRealTimers();
    MockContainerDatabase.clear();
    MockTableDatabase.clear();
    // Cascade removes any resourcePublications rows too
    await mockContext.db.delete(resources);
    await mockContext.db.delete(storageLedger);
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

    expect(takeOne(publishedItems).publication?.publishVersion).toBe(1);
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
    const subscription = await dashboardCaller.onSaveResourceContent({ id: newResource.id });
    const data = await getFirstEmit(
      () => subscription,
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
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: ${STALE_CONTENT_VERSION_ERROR_MESSAGE}]`);
  });

  // The delta is a plain zstd frame with the stored bytes as its dictionary, which is what the browser's encoder
  // Writes; node's own encoder stands in for it here
  test("saves a delta against the stored content and returns the stored bytes' hash", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    const savedResource = await dashboardCaller.saveResourceContent({
      content: new Dashboard(),
      contentVersion: 0,
      id: newResource.id,
    });
    const baseline = MockContainerDatabase.get(AzureContainer.ResourceAssets)?.get(getContentBlobName(newResource.id));
    assert.exists(baseline);
    const dashboard = new Dashboard({ visuals: [new Visual()] });
    const delta = zstdCompressSync(JSON.stringify(dashboard), { dictionary: baseline }).toBase64();
    const updatedResource = await dashboardCaller.saveResourceContentDelta({
      baselineHash: savedResource.contentHash,
      contentVersion: savedResource.contentVersion,
      delta,
      id: newResource.id,
    });
    const content = await dashboardCaller.readResourceContent({ id: newResource.id });
    const storedContent = MockContainerDatabase.get(AzureContainer.ResourceAssets)?.get(
      getContentBlobName(newResource.id),
    );
    assert.exists(storedContent);

    expect(savedResource.contentHash).toBe(createHash("sha256").update(baseline).digest("hex"));
    expect(updatedResource.contentVersion).toBe(2);
    expect(updatedResource.contentHash).toBe(createHash("sha256").update(storedContent).digest("hex"));
    expect(content).toStrictEqual(jsonDateParse(JSON.stringify(dashboard)));
  });

  // Another device's save moved the stored bytes, so the client's baseline no longer names them
  test("fails save content delta against a baseline the resource no longer holds", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    const { contentHash } = await dashboardCaller.saveResourceContent({
      content: new Dashboard(),
      contentVersion: 0,
      id: newResource.id,
    });
    await dashboardCaller.saveResourceContent({
      content: new Dashboard({ visuals: [new Visual()] }),
      contentVersion: 1,
      id: newResource.id,
    });

    await expect(
      dashboardCaller.saveResourceContentDelta({
        baselineHash: contentHash,
        contentVersion: 2,
        delta: "",
        id: newResource.id,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: ${CONTENT_BASELINE_MISMATCH_ERROR_MESSAGE}]`);
    await expect(resourceCaller.readResource({ id: newResource.id })).resolves.toHaveProperty("contentVersion", 2);
  });

  test("commits staged content and releases its staging blob", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    const dashboard = new Dashboard({ visuals: [new Visual()] });
    const hash = await stageContent(newResource.id, gzipSync(JSON.stringify(dashboard)));
    const updatedResource = await dashboardCaller.saveStagedResourceContent({
      contentVersion: newResource.contentVersion,
      hash,
      id: newResource.id,
    });
    const content = await dashboardCaller.readResourceContent({ id: newResource.id });
    const storageLedgerEntries = await mockContext.db.query.storageLedger.findMany();

    expect(updatedResource.contentVersion).toBe(1);
    expect(content).toStrictEqual(jsonDateParse(JSON.stringify(dashboard)));
    expect(
      MockContainerDatabase.get(AzureContainer.ResourceAssets)?.has(getStagingContentBlobName(newResource.id)),
    ).toBe(false);
    // The content blob's own charge is all that is left
    expect(storageLedgerEntries.map(({ blobName }) => blobName)).toStrictEqual([getContentBlobName(newResource.id)]);
  });

  test("fails commit staged content that does not match its hash", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    const hash = await stageContent(newResource.id, gzipSync(JSON.stringify(new Dashboard())));
    await stageContent(newResource.id, gzipSync(JSON.stringify(new Dashboard({ visuals: [new Visual()] }))));

    await expect(
      dashboardCaller.saveStagedResourceContent({ contentVersion: 0, hash, id: newResource.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Update, name: Resource, staged content does not match its hash]`,
    );
    await expect(resourceCaller.readResource({ id: newResource.id })).resolves.toHaveProperty("contentVersion", 0);
  });

  test("fails commit staged content replaced after it was measured", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    const compressedContent = gzipSync(JSON.stringify(new Dashboard()));
    const hash = await stageContent(newResource.id, compressedContent);
    const containerClient = await useContainerClient(AzureContainer.ResourceAssets);
    const { etag } = await containerClient
      .getBlockBlobClient(getStagingContentBlobName(newResource.id))
      .getProperties();
    const downloadToBuffer = vi
      .spyOn(MockBlobClient.prototype, "downloadToBuffer")
      .mockRejectedValueOnce(new MockRestError("", 412));

    await expect(
      dashboardCaller.saveStagedResourceContent({ contentVersion: 0, hash, id: newResource.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Update, name: Resource, staged content does not match its hash]`,
    );
    expect(downloadToBuffer).toHaveBeenCalledWith(0, compressedContent.byteLength, { conditions: { ifMatch: etag } });
    await expect(resourceCaller.readResource({ id: newResource.id })).resolves.toHaveProperty("contentVersion", 0);
    expect(
      MockContainerDatabase.get(AzureContainer.ResourceAssets)?.get(getStagingContentBlobName(newResource.id)),
    ).toStrictEqual(compressedContent);
  });

  test("fails commit staged content larger than the content limit", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    const hash = await stageContent(newResource.id, gzipSync(JSON.stringify(new Dashboard())));
    vi.spyOn(MockBlobClient.prototype, "getProperties").mockResolvedValueOnce({
      _response: { headers: {}, request: {}, status: 200 },
      contentLength: MAX_RESOURCE_CONTENT_SIZE + 1,
    } as Awaited<ReturnType<MockBlobClient["getProperties"]>>);

    await expect(
      dashboardCaller.saveStagedResourceContent({ contentVersion: 0, hash, id: newResource.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Update, name: Resource, staged content is larger than 100000000 bytes]`,
    );
    await expect(resourceCaller.readResource({ id: newResource.id })).resolves.toHaveProperty("contentVersion", 0);
  });

  test("fails commit staged content that inflates past the content limit", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    const hash = await stageContent(newResource.id, gzipSync(Buffer.alloc(MAX_RESOURCE_CONTENT_SIZE + 1)));

    await expect(
      dashboardCaller.saveStagedResourceContent({ contentVersion: 0, hash, id: newResource.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Update, name: Resource, staged content is not a gzip of at most 100000000 bytes]`,
    );
    await expect(resourceCaller.readResource({ id: newResource.id })).resolves.toHaveProperty("contentVersion", 0);
  });

  test("fails commit staged content with old content version", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    await dashboardCaller.saveResourceContent({ content: new Dashboard(), contentVersion: 0, id: newResource.id });
    const hash = await stageContent(newResource.id, gzipSync(JSON.stringify(new Dashboard())));

    await expect(
      dashboardCaller.saveStagedResourceContent({ contentVersion: 0, hash, id: newResource.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: ${STALE_CONTENT_VERSION_ERROR_MESSAGE}]`);
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

  // The channels number and anchor independently but share one object space: a publish of content the revision
  // Channel already holds is a row over that channel's object, so the unpublish that releases it must leave
  // What a revision still names — a bare delete of the channel's objects would be a revision that cannot be read
  test("unpublishes resource without collecting an object the revision channel still names", async () => {
    expect.hasAssertions();

    const newResource = await dashboardCaller.createResource({ name });
    await dashboardCaller.saveResourceContent({ content: new Dashboard(), contentVersion: 0, id: newResource.id });
    await resourceCaller.saveResourceRevision({ id: newResource.id });
    await dashboardCaller.publishResource({ id: newResource.id });
    const [revisionVersion, publishedVersion] = await mockContext.db.query.resourceVersions.findMany({
      columns: { hash: true },
      orderBy: { channel: "desc" },
      where: { resourceId: { eq: newResource.id } },
    });
    const publishedEventCount = MockEventGridDatabase.get("")?.length ?? 0;

    // The premise: the published version deduplicated against the revision's object
    expect(publishedVersion).toStrictEqual(revisionVersion);

    await dashboardCaller.unpublishResource({ id: newResource.id });

    await expect(dashboardCaller.readResourcePublication({ id: newResource.id })).resolves.toBeUndefined();
    await expect(
      dashboardCaller.readPublishedResourceContent(newResource.id),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.ResourcePublication, newResource.id).message}]`,
    );
    await expect(resourceCaller.readSnapshotHistory({ id: newResource.id })).resolves.toHaveLength(1);
    // The one deletion an unpublish always publishes is the asset clones' prefix, never the object
    const blobDeletionEvents = (MockEventGridDatabase.get("")?.slice(publishedEventCount) ?? []).filter(
      ({ eventType }) => eventType === AzureFunction.ProcessBlobDeletion,
    );

    expect(blobDeletionEvents).toHaveLength(1);
    expect(takeOne(blobDeletionEvents).data as BlobDeletionEventGridData).toStrictEqual({
      containerName: AzureContainer.ResourceAssets,
      createdBefore: new Date(0),
      prefix: `${newResource.id}/${SnapshotChannel.Published}`,
    });
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
    vi.spyOn(MockBlobClient.prototype, "download").mockRejectedValue(new MockRestError("", 404));

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

    // A non-publishable type (Sheet) has no publish endpoints at all — capability gating, not just a guard.
    // The dashboardCaller proxy is permissive at runtime, so absence is asserted on the router's procedure record.
    const publishableProcedures = new Set(Object.keys(dashboardRouter._def.procedures));
    const nonPublishableProcedures = new Set(Object.keys(sheetRouter._def.procedures));

    // View counting rides the publishable capability, so it is gated by the same seam
    expect(publishableProcedures.difference(nonPublishableProcedures)).toStrictEqual(
      new Set([
        "publishResource",
        "readPublishedResourceContent",
        "readPublishedVersionContent",
        "readResourcePublication",
        "readResourceViewCount",
        "unpublishResource",
      ]),
    );
    expect(nonPublishableProcedures.difference(publishableProcedures)).toStrictEqual(new Set());
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
    vi.spyOn(MockTableClient.prototype, "createEntity").mockRejectedValue(new Error(" "));
    vi.spyOn(MockTableClient.prototype, "updateEntity").mockRejectedValue(new Error(" "));
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
      { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.Eq, value: newResource.id },
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

    await expect(webpageCaller.deleteFile({ blobPath: `../../${crypto.randomUUID()}/${filename}`, id: newResource.id }))
      .rejects.toThrowErrorMatchingInlineSnapshot(`
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

    const fileAssetsProcedures = new Set(Object.keys(webpageRouter._def.procedures));
    const nonFileAssetsProcedures = new Set(Object.keys(dashboardRouter._def.procedures));

    expect(fileAssetsProcedures.difference(nonFileAssetsProcedures)).toStrictEqual(
      new Set(["deleteFile", "generateUploadFileSasEntities"]),
    );
    expect(nonFileAssetsProcedures.difference(fileAssetsProcedures)).toStrictEqual(new Set());
  });
});
