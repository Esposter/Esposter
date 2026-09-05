import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { Resource } from "@esposter/db-schema";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { SnapshotChannel } from "#shared/models/resource/SnapshotChannel";
import { SnapshotReason } from "#shared/models/resource/SnapshotReason";
import { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";
import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor";
import { EN_US_COMPARATOR } from "#shared/services/intl/constants";
import { FILES_DIRECTORY_SEGMENT } from "#shared/services/resource/constants";
import { getFilesDirectoryName } from "#shared/services/resource/getFilesDirectoryName";
import { getResourceAssetUrl } from "#shared/services/resource/getResourceAssetUrl";
import { waitForSynchronizedFunctions } from "#shared/util/function/getSynchronizedFunction";
import { CONTENT_SAVED_COALESCE_WINDOW_MS } from "@@/server/services/resource/constants";
import { resourceEventEmitter } from "@@/server/services/resource/events/resourceEventEmitter";
import { createSnapshotAssetsDirectoryName } from "@@/server/services/resource/snapshot/createSnapshotAssetsDirectoryName";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, mockSessionOnce } from "@@/server/trpc/context.test";
import { dashboardRouter } from "@@/server/trpc/routers/dashboard";
import { resourceRouter } from "@@/server/trpc/routers/resource";
import { sheetRouter } from "@@/server/trpc/routers/sheet";
import { todoListRouter } from "@@/server/trpc/routers/todoList";
import { webpageRouter } from "@@/server/trpc/routers/webpage";
import { getContentBlobName } from "@esposter/db";
import {
  AzureContainer,
  AzureQueue,
  AzureTable,
  ResourceActivityType,
  resources,
  ResourceType,
} from "@esposter/db-schema";
import { ID_SEPARATOR, jsonDateParse, takeOne } from "@esposter/shared";
import { MockContainerDatabase, MockServiceBusDatabase, MockTableDatabase } from "azure-mock";
import { afterEach, assert, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

// A clone mints a fresh asset id rather than carrying the source's over, so its blob is found by where it
// Landed, never by rebuilding its name
const readFilesBlobNames = (id: string): string[] => {
  const container = MockContainerDatabase.get(AzureContainer.ResourceAssets);
  assert(container);
  return [...container.keys()].filter((blobName) => blobName.startsWith(`${getFilesDirectoryName(id)}/`));
};

// Everything a publish writes lands under the resource's published prefix: the snapshot itself beside a
// Directory of cloned assets
const readPublishedBlobSizes = (id: string): number[] => {
  const container = MockContainerDatabase.get(AzureContainer.ResourceAssets);
  assert(container);
  return [...container.entries()]
    .filter(([blobName]) => blobName.startsWith(`${id}/${SnapshotChannel.Published}/`))
    .map(([, data]) => data.byteLength);
};

describe("resource", () => {
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRPCRouter["resource"]>;
  let dashboardCaller: DecorateRouterRecord<TRPCRouter["dashboard"]>;
  let sheetCaller: DecorateRouterRecord<TRPCRouter["sheet"]>;
  let todoListCaller: DecorateRouterRecord<TRPCRouter["todoList"]>;
  let webpageCaller: DecorateRouterRecord<TRPCRouter["webpage"]>;
  const name = "name";
  const filename = "filename";
  const label = "before the layout redo";
  const webpageEditor = new WebpageEditor({ css: "a", html: "a" });
  // The clock is pinned at the epoch, so the smallest future instant is all a reminder needs to be scheduled
  const dueAt = new Date(1);

  const readStorageBytesUsed = async (userId: Resource["userId"]) =>
    (await mockContext.db.query.users.findFirst({ columns: { storageBytesUsed: true }, where: { id: { eq: userId } } }))
      ?.storageBytesUsed;

  // The version rides the row, so only a test writing a second time has to say which version it is claiming
  const saveWebpageContent = (webpageResource: Resource, content: WebpageEditor, contentVersionOffset = 0) =>
    webpageCaller.saveResourceContent({
      content,
      contentVersion: webpageResource.contentVersion + contentVersionOffset,
      id: webpageResource.id,
    });

  beforeAll(async () => {
    mockContext = await createMockContext();
    caller = createCallerFactory(resourceRouter)(mockContext);
    dashboardCaller = createCallerFactory(dashboardRouter)(mockContext);
    sheetCaller = createCallerFactory(sheetRouter)(mockContext);
    todoListCaller = createCallerFactory(todoListRouter)(mockContext);
    webpageCaller = createCallerFactory(webpageRouter)(mockContext);
  });

  // `updatedAt` is populated by drizzle's $onUpdateFn(() => new Date()), so faking Date makes recency
  // Deterministic.
  // Only Date: vitest's default set also fakes `process.hrtime`, which every Azure Table row key is derived from,
  // And a frozen tick makes two writes to one partition collide on the same key
  beforeEach(() => {
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
  });

  afterEach(async () => {
    vi.useRealTimers();
    resourceEventEmitter.removeAllListeners("saveResourceContent");
    MockContainerDatabase.clear();
    MockServiceBusDatabase.clear();
    MockTableDatabase.clear();
    await mockContext.db.delete(resources);
  });

  test("reads empty resources", async () => {
    expect.hasAssertions();

    const { items } = await caller.readResources();

    expect(items).toStrictEqual([]);
  });

  test("reads a single resource by id", async () => {
    expect.hasAssertions();

    const dashboardResource = await dashboardCaller.createResource({ name });
    const resource = await caller.readResource({ id: dashboardResource.id });

    expect(resource).toStrictEqual({ ...dashboardResource, publication: null });
  });

  test("reads a resource with its publication", async () => {
    expect.hasAssertions();

    const webpageResource = await webpageCaller.createResource({ name });
    await saveWebpageContent(webpageResource, webpageEditor);
    const draftResource = await caller.readResource({ id: webpageResource.id });

    // Null is the answer "this resource is not published", which is a resolved state rather than a missing one
    expect(draftResource.publication).toBeNull();

    await webpageCaller.publishResource({ id: webpageResource.id });
    const publishedResource = await caller.readResource({ id: webpageResource.id });

    expect(publishedResource.publication?.publishVersion).toBe(1);
  });

  test("reads resources across every type", async () => {
    expect.hasAssertions();

    const dashboardResource = await dashboardCaller.createResource({ name });
    const sheetResource = await sheetCaller.createResource({ name });
    const { items } = await caller.readResources();

    expect(
      items
        .map(({ id }) => id)
        .toSorted((firstValue, secondValue) => EN_US_COMPARATOR.compare(firstValue, secondValue)),
    ).toStrictEqual(
      [dashboardResource.id, sheetResource.id].toSorted((firstValue, secondValue) =>
        EN_US_COMPARATOR.compare(firstValue, secondValue),
      ),
    );
    expect(
      items
        .map(({ type }) => type)
        .toSorted((firstValue, secondValue) => EN_US_COMPARATOR.compare(firstValue, secondValue)),
    ).toStrictEqual(
      [ResourceType.Dashboard, ResourceType.Sheet].toSorted((firstValue, secondValue) =>
        EN_US_COMPARATOR.compare(firstValue, secondValue),
      ),
    );
  });

  test("filters resources by type", async () => {
    expect.hasAssertions();

    const dashboardResource = await dashboardCaller.createResource({ name });
    await sheetCaller.createResource({ name });
    const { items } = await caller.readResources({ types: [ResourceType.Dashboard] });

    expect(items.map(({ id }) => id)).toStrictEqual([dashboardResource.id]);
  });

  test("filters resources by search query", async () => {
    expect.hasAssertions();

    const matchingResource = await dashboardCaller.createResource({ name: "quarterly report" });
    await sheetCaller.createResource({ name: "grocery list" });
    const { items } = await caller.readResources({ searchQuery: "report" });

    expect(items.map(({ id }) => id)).toStrictEqual([matchingResource.id]);
  });

  test("ranks prefix matches before substring matches", async () => {
    expect.hasAssertions();

    // The prefix match is created first (older), so without ranking the newer substring match would come first
    const prefixResource = await dashboardCaller.createResource({ name: `${name} a` });
    vi.advanceTimersByTime(1);
    const substringResource = await sheetCaller.createResource({ name: `a ${name}` });
    const { items } = await caller.readResources({ searchQuery: name });

    expect(items.map(({ id }) => id)).toStrictEqual([prefixResource.id, substringResource.id]);
  });

  test("orders by updatedAt desc within a match tier", async () => {
    expect.hasAssertions();

    const olderResource = await dashboardCaller.createResource({ name });
    vi.advanceTimersByTime(1);
    const newerResource = await sheetCaller.createResource({ name });
    const { items } = await caller.readResources({ searchQuery: name });

    expect(items.map(({ id }) => id)).toStrictEqual([newerResource.id, olderResource.id]);
  });

  test("counts resources across every type", async () => {
    expect.hasAssertions();

    await dashboardCaller.createResource({ name });
    await sheetCaller.createResource({ name });

    const count = await caller.readResourcesCount();

    expect(count).toBe(2);
  });

  test("counts resources filtered by type", async () => {
    expect.hasAssertions();

    await dashboardCaller.createResource({ name });
    await sheetCaller.createResource({ name });

    const count = await caller.readResourcesCount({ types: [ResourceType.Dashboard] });

    expect(count).toBe(1);
  });

  test("counts resources filtered by search query", async () => {
    expect.hasAssertions();

    await dashboardCaller.createResource({ name: "quarterly report" });
    await sheetCaller.createResource({ name: "grocery list" });

    const count = await caller.readResourcesCount({ searchQuery: "report" });

    expect(count).toBe(1);
  });

  test("counts resources grouped by type", async () => {
    expect.hasAssertions();

    await dashboardCaller.createResource({ name });
    await sheetCaller.createResource({ name });
    await sheetCaller.createResource({ name });

    const resourceTypeCounts = await caller.readResourceTypeCounts();

    // Ordered by count desc, so the busiest type leads the summary cards
    expect(resourceTypeCounts).toStrictEqual([
      { count: 2, type: ResourceType.Sheet },
      { count: 1, type: ResourceType.Dashboard },
    ]);
  });

  test("omits types with no resources from the grouped count", async () => {
    expect.hasAssertions();

    await dashboardCaller.createResource({ name });

    const resourceTypeCounts = await caller.readResourceTypeCounts();

    expect(resourceTypeCounts).toStrictEqual([{ count: 1, type: ResourceType.Dashboard }]);
  });

  test("counts grouped by type filtered by search query", async () => {
    expect.hasAssertions();

    await dashboardCaller.createResource({ name: "quarterly report" });
    await sheetCaller.createResource({ name: "grocery list" });

    const resourceTypeCounts = await caller.readResourceTypeCounts({ searchQuery: "report" });

    expect(resourceTypeCounts).toStrictEqual([{ count: 1, type: ResourceType.Dashboard }]);
  });

  test("counts grouped by type only for the caller's own resources", async () => {
    expect.hasAssertions();

    await mockSessionOnce(mockContext.db);
    await dashboardCaller.createResource({ name });
    await sheetCaller.createResource({ name });

    const resourceTypeCounts = await caller.readResourceTypeCounts();

    expect(resourceTypeCounts).toStrictEqual([{ count: 1, type: ResourceType.Sheet }]);
  });

  test("filters resources by published status", async () => {
    expect.hasAssertions();

    const webpageResource = await webpageCaller.createResource({ name });
    await saveWebpageContent(webpageResource, webpageEditor);
    await webpageCaller.publishResource({ id: webpageResource.id });
    const draftResource = await dashboardCaller.createResource({ name });
    const { items: publishedItems } = await caller.readResources({ isPublished: true });
    const { items: draftItems } = await caller.readResources({ isPublished: false });
    const publishedCount = await caller.readResourcesCount({ isPublished: true });

    expect(publishedItems.map(({ id }) => id)).toStrictEqual([webpageResource.id]);
    expect(draftItems.map(({ id }) => id)).toStrictEqual([draftResource.id]);
    expect(publishedCount).toBe(1);
  });

  test("filters resources by updated date range", async () => {
    expect.hasAssertions();

    const olderResource = await dashboardCaller.createResource({ name });
    vi.advanceTimersByTime(1);
    const newerResource = await sheetCaller.createResource({ name });
    const { items: updatedAfterItems } = await caller.readResources({ updatedAfter: new Date(1) });
    const { items: updatedBeforeItems } = await caller.readResources({ updatedBefore: new Date(0) });

    expect(updatedAfterItems.map(({ id }) => id)).toStrictEqual([newerResource.id]);
    expect(updatedBeforeItems.map(({ id }) => id)).toStrictEqual([olderResource.id]);
  });

  test("deletes resources in bulk", async () => {
    expect.hasAssertions();

    const dashboardResource = await dashboardCaller.createResource({ name });
    const sheetResource = await sheetCaller.createResource({ name });
    const deletedResources = await caller.deleteResources({ ids: [dashboardResource.id, sheetResource.id] });
    const count = await caller.readResourcesCount();

    expect(
      deletedResources
        .map(({ id }) => id)
        .toSorted((firstValue, secondValue) => EN_US_COMPARATOR.compare(firstValue, secondValue)),
    ).toStrictEqual(
      [dashboardResource.id, sheetResource.id].toSorted((firstValue, secondValue) =>
        EN_US_COMPARATOR.compare(firstValue, secondValue),
      ),
    );
    expect(count).toBe(0);
  });

  test("does not delete other users' resources in bulk", async () => {
    expect.hasAssertions();

    await mockSessionOnce(mockContext.db);
    const otherUserResource = await dashboardCaller.createResource({ name });
    const ownResource = await sheetCaller.createResource({ name });
    const deletedResources = await caller.deleteResources({ ids: [otherUserResource.id, ownResource.id] });

    expect(deletedResources.map(({ id }) => id)).toStrictEqual([ownResource.id]);
  });

  // A snapshot and its cloned assets are stored bytes the owner keeps, and nothing else charges them: a
  // Server-side write raises a BlobCreated for a blob no reserve ever ledgered, so the counter would never move
  test("charges the owner for the snapshot and the assets a publish clones", async () => {
    expect.hasAssertions();

    const webpageResource = await webpageCaller.createResource({ name });
    const blobName = `${getFilesDirectoryName(webpageResource.id)}/${crypto.randomUUID()}${ID_SEPARATOR}${filename}`;
    MockContainerDatabase.set(AzureContainer.ResourceAssets, new Map([[blobName, Buffer.alloc(1)]]));
    await saveWebpageContent(
      webpageResource,
      new WebpageEditor({ css: "a", html: `<img src="${getResourceAssetUrl(blobName)}">` }),
    );
    const storageBytesUsedBeforePublish = await readStorageBytesUsed(webpageResource.userId);
    await webpageCaller.publishResource({ id: webpageResource.id });
    const publishedBlobSizes = readPublishedBlobSizes(webpageResource.id);
    assert.exists(storageBytesUsedBeforePublish);

    // The snapshot and the one asset it references
    expect(publishedBlobSizes).toHaveLength(2);
    await expect(readStorageBytesUsed(webpageResource.userId)).resolves.toBe(
      storageBytesUsedBeforePublish + publishedBlobSizes.reduce((total, bytes) => total + bytes, 0),
    );
  });

  test("duplicates a resource with content as a draft copy", async () => {
    expect.hasAssertions();

    const webpageResource = await webpageCaller.createResource({ name });
    const blobName = `${getFilesDirectoryName(webpageResource.id)}/${crypto.randomUUID()}${ID_SEPARATOR}${filename}`;
    MockContainerDatabase.set(AzureContainer.ResourceAssets, new Map([[blobName, Buffer.alloc(1)]]));
    await saveWebpageContent(
      webpageResource,
      new WebpageEditor({ css: "a", html: `<img src="${getResourceAssetUrl(blobName)}">` }),
    );
    await webpageCaller.publishResource({ id: webpageResource.id });
    const duplicatedResource = await caller.duplicateResource({ id: webpageResource.id });
    const content = await webpageCaller.readResourceContent({ id: duplicatedResource.id });
    assert.exists(content);

    const publication = await webpageCaller.readResourcePublication({ id: duplicatedResource.id });
    // The copy owns its assets: the file is cloned into the copy's files directory and the url rewritten to it
    const duplicatedBlobName = takeOne(readFilesBlobNames(duplicatedResource.id));

    expect(duplicatedResource.id).not.toBe(webpageResource.id);
    expect(duplicatedBlobName.endsWith(`${ID_SEPARATOR}${filename}`)).toBe(true);
    expect(duplicatedResource.name).toBe(`${name} (copy)`);
    expect(duplicatedResource.type).toBe(ResourceType.Webpage);
    expect(content).toStrictEqual(
      jsonDateParse(
        JSON.stringify(
          new WebpageEditor({
            css: "a",
            html: `<img src="${getResourceAssetUrl(duplicatedBlobName)}">`,
            id: content.id,
          }),
        ),
      ),
    );
    expect(MockContainerDatabase.get(AzureContainer.ResourceAssets)?.has(duplicatedBlobName)).toBe(true);
    expect(publication).toBeUndefined();
  });

  test("duplicates a resource with a published asset reference by cloning it under the copy", async () => {
    expect.hasAssertions();

    const webpageResource = await webpageCaller.createResource({ name });
    const publishedBlobName = `${createSnapshotAssetsDirectoryName(webpageResource.id, SnapshotChannel.Published)}/${FILES_DIRECTORY_SEGMENT}/${crypto.randomUUID()}${ID_SEPARATOR}${filename}`;
    MockContainerDatabase.set(AzureContainer.ResourceAssets, new Map([[publishedBlobName, Buffer.alloc(1)]]));
    await saveWebpageContent(
      webpageResource,
      new WebpageEditor({ css: "a", html: `<img src="${getResourceAssetUrl(publishedBlobName)}">` }),
    );
    const duplicatedResource = await caller.duplicateResource({ id: webpageResource.id });
    const content = await webpageCaller.readResourceContent({ id: duplicatedResource.id });
    assert.exists(content);

    const duplicatedBlobName = takeOne(readFilesBlobNames(duplicatedResource.id));

    // The copy is fully self-contained: the published snapshot asset is cloned into the copy's own files
    // Directory — never under its published prefix, which unpublishing wipes — so unpublishing or deleting
    // Either resource never strands the copy
    expect(content.html).toBe(`<img src="${getResourceAssetUrl(duplicatedBlobName)}">`);
    expect(duplicatedBlobName.endsWith(`${ID_SEPARATOR}${filename}`)).toBe(true);
  });

  test("duplicates a resource with a dangling asset reference by carrying the url verbatim", async () => {
    expect.hasAssertions();

    const webpageResource = await webpageCaller.createResource({ name });
    const blobName = `${getFilesDirectoryName(webpageResource.id)}/${crypto.randomUUID()}${ID_SEPARATOR}${filename}`;
    const missingBlobName = `${getFilesDirectoryName(webpageResource.id)}/${crypto.randomUUID()}${ID_SEPARATOR}${filename}`;
    MockContainerDatabase.set(AzureContainer.ResourceAssets, new Map([[blobName, Buffer.alloc(1)]]));
    await webpageCaller.saveResourceContent({
      content: new WebpageEditor({
        css: "a",
        html: `<img src="${getResourceAssetUrl(blobName)}"><img src="${getResourceAssetUrl(missingBlobName)}">`,
      }),
      contentVersion: webpageResource.contentVersion,
      id: webpageResource.id,
    });
    const duplicatedResource = await caller.duplicateResource({ id: webpageResource.id });
    const content = await webpageCaller.readResourceContent({ id: duplicatedResource.id });
    assert.exists(content);

    const duplicatedBlobName = takeOne(readFilesBlobNames(duplicatedResource.id));

    // The existing asset is cloned and rewritten; the dangling url is data, carried verbatim instead of
    // Failing the whole clone
    expect(content.html).toBe(
      `<img src="${getResourceAssetUrl(duplicatedBlobName)}"><img src="${getResourceAssetUrl(missingBlobName)}">`,
    );
    expect(duplicatedBlobName.endsWith(`${ID_SEPARATOR}${filename}`)).toBe(true);
  });

  test("restores a published version by cloning its assets back into the working copy", async () => {
    expect.hasAssertions();

    const webpageResource = await webpageCaller.createResource({ name });
    const blobName = `${getFilesDirectoryName(webpageResource.id)}/${crypto.randomUUID()}${ID_SEPARATOR}${filename}`;
    MockContainerDatabase.set(AzureContainer.ResourceAssets, new Map([[blobName, Buffer.alloc(1)]]));
    await saveWebpageContent(
      webpageResource,
      new WebpageEditor({ css: "a", html: `<img src="${getResourceAssetUrl(blobName)}">` }),
    );
    await webpageCaller.publishResource({ id: webpageResource.id });
    await caller.restoreSnapshotVersion({ channel: SnapshotChannel.Published, id: webpageResource.id, version: 1 });
    const content = await webpageCaller.readResourceContent({ id: webpageResource.id });
    assert.exists(content);

    const filesBlobNames = readFilesBlobNames(webpageResource.id);
    const restoredBlobName = takeOne(filesBlobNames.filter((filesBlobName) => filesBlobName !== blobName));

    // The restored draft references its own files directory, never the published snapshot it came from — and
    // Never the name it started under: `deleteFile` may already have published that exact name for deletion,
    // And a named-blob deletion event carries no time bound to disqualify a replay of it
    expect(content.html).toBe(`<img src="${getResourceAssetUrl(restoredBlobName)}">`);
    expect(filesBlobNames).toContain(blobName);
    expect(restoredBlobName.endsWith(`${ID_SEPARATOR}${filename}`)).toBe(true);
  });

  test("cleans up the copy when duplicating its content fails", async () => {
    expect.hasAssertions();

    const webpageResource = await webpageCaller.createResource({ name });
    await saveWebpageContent(webpageResource, webpageEditor);
    // Corrupt the stored draft so reading it back for the copy fails after the copy's row already exists
    const container = MockContainerDatabase.get(AzureContainer.ResourceAssets);
    assert(container);
    container.set(getContentBlobName(webpageResource.id), Buffer.from("a"));

    await expect(caller.duplicateResource({ id: webpageResource.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Unexpected token 'a', "a" is not valid JSON]`,
    );

    const { items } = await caller.readResources();

    // The copy is fully reverted: no row and no blobs outside the original's directory
    expect(items.map(({ id }) => id)).toStrictEqual([webpageResource.id]);
    expect([...container.keys()].every((key) => key.startsWith(`${webpageResource.id}/`))).toBe(true);
  });

  test("runs the after-save hook for a duplicated resource", async () => {
    expect.hasAssertions();

    const todoListResource = await todoListCaller.createResource({ name });
    const item = new TodoListItem({ dueAt, name });
    await todoListCaller.saveResourceContent({
      content: { items: [item] },
      contentVersion: todoListResource.contentVersion,
      id: todoListResource.id,
    });
    const duplicatedResource = await caller.duplicateResource({ id: todoListResource.id });
    await waitForSynchronizedFunctions();
    const reminder = { dueAt, itemId: item.id };

    expect(MockServiceBusDatabase.get(AzureQueue.TodoReminders)).toStrictEqual([
      { body: { ...reminder, resourceId: todoListResource.id }, scheduledEnqueueTimeUtc: dueAt },
      { body: { ...reminder, resourceId: duplicatedResource.id }, scheduledEnqueueTimeUtc: dueAt },
    ]);
  });

  test("duplicates a resource without content", async () => {
    expect.hasAssertions();

    const dashboardResource = await dashboardCaller.createResource({ name });
    const duplicatedResource = await caller.duplicateResource({ id: dashboardResource.id });
    const content = await dashboardCaller.readResourceContent({ id: duplicatedResource.id });

    expect(duplicatedResource.name).toBe(`${name} (copy)`);
    expect(content).toBeUndefined();
  });

  test("copies tags when duplicating a resource", async () => {
    expect.hasAssertions();

    const tags = { env: "prod" };
    const dashboardResource = await dashboardCaller.createResource({ name });
    await dashboardCaller.updateResource({ id: dashboardResource.id, name, tags });
    const duplicatedResource = await caller.duplicateResource({ id: dashboardResource.id });

    expect(duplicatedResource.tags).toStrictEqual(tags);
  });

  test("finds a resource whose name is mistyped", async () => {
    expect.hasAssertions();

    const surveyResource = await dashboardCaller.createResource({ name: "Survey" });
    await sheetCaller.createResource({ name: "grocery list" });
    // No substring of "Survey" contains "survye" — only trigram similarity can bridge the transposition
    const { items } = await caller.readResources({ searchQuery: "survye" });

    expect(items.map(({ id }) => id)).toStrictEqual([surveyResource.id]);
  });

  test("ranks the closest trigram match first", async () => {
    expect.hasAssertions();

    // The near-match is created first (older), so without similarity ranking the newer one would lead
    const nearMatchResource = await dashboardCaller.createResource({ name: "quarterly report" });
    vi.advanceTimersByTime(1);
    await sheetCaller.createResource({ name: "quarterly report of the reported reports" });
    const { items } = await caller.readResources({ searchQuery: "quarterly report" });

    expect(takeOne(items).id).toBe(nearMatchResource.id);
  });

  test("toggles a favorite on and off", async () => {
    expect.hasAssertions();

    const dashboardResource = await dashboardCaller.createResource({ name });
    const isFavoriteAfterStar = await caller.toggleFavorite({ id: dashboardResource.id });
    const favoritesAfterStar = await caller.readFavorites();
    const isFavoriteAfterUnstar = await caller.toggleFavorite({ id: dashboardResource.id });
    const favoritesAfterUnstar = await caller.readFavorites();

    expect(isFavoriteAfterStar).toBe(true);
    expect(favoritesAfterStar.map(({ id }) => id)).toStrictEqual([dashboardResource.id]);
    expect(isFavoriteAfterUnstar).toBe(false);
    expect(favoritesAfterUnstar).toStrictEqual([]);
  });

  test("does not read a soft-deleted resource as a favorite", async () => {
    expect.hasAssertions();

    const dashboardResource = await dashboardCaller.createResource({ name });
    await caller.toggleFavorite({ id: dashboardResource.id });
    await caller.deleteResources({ ids: [dashboardResource.id] });
    const favorites = await caller.readFavorites();

    expect(favorites).toStrictEqual([]);
  });

  test("filters resources by tag containment", async () => {
    expect.hasAssertions();

    const taggedResource = await dashboardCaller.createResource({ name });
    await dashboardCaller.updateResource({ id: taggedResource.id, name, tags: { env: "prod", owner: "ops" } });
    const otherResource = await sheetCaller.createResource({ name });
    await sheetCaller.updateResource({ id: otherResource.id, name, tags: { env: "dev" } });
    const { items } = await caller.readResources({ tags: { env: "prod" } });
    const tagCount = await caller.readResourcesCount({ tags: { env: "prod" } });

    expect(items.map(({ id }) => id)).toStrictEqual([taggedResource.id]);
    expect(takeOne(items).tags).toStrictEqual({ env: "prod", owner: "ops" });
    expect(tagCount).toBe(1);
  });

  test("replaces the whole tag record on update", async () => {
    expect.hasAssertions();

    const dashboardResource = await dashboardCaller.createResource({ name });
    await dashboardCaller.updateResource({ id: dashboardResource.id, name, tags: { env: "prod", owner: "ops" } });
    const updatedResource = await dashboardCaller.updateResource({
      id: dashboardResource.id,
      name,
      tags: { env: "dev" },
    });

    expect(updatedResource.tags).toStrictEqual({ env: "dev" });
  });

  test("moves a deleted resource to the bin instead of destroying it", async () => {
    expect.hasAssertions();

    const dashboardResource = await dashboardCaller.createResource({ name });
    await caller.deleteResources({ ids: [dashboardResource.id] });
    const { items: deletedItems } = await caller.readDeletedResources();
    const deletedCount = await caller.readDeletedResourcesCount();
    const liveCount = await caller.readResourcesCount();

    expect(deletedItems.map(({ id }) => id)).toStrictEqual([dashboardResource.id]);
    expect(deletedCount).toBe(1);
    expect(liveCount).toBe(0);
  });

  test("does not read a soft-deleted resource by id", async () => {
    expect.hasAssertions();

    const dashboardResource = await dashboardCaller.createResource({ name });
    await caller.deleteResources({ ids: [dashboardResource.id] });

    await expect(caller.readResource({ id: dashboardResource.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test("unpublishes a resource when it is deleted", async () => {
    expect.hasAssertions();

    const webpageResource = await webpageCaller.createResource({ name });
    await saveWebpageContent(webpageResource, webpageEditor);
    await webpageCaller.publishResource({ id: webpageResource.id });
    await caller.deleteResources({ ids: [webpageResource.id] });
    await caller.restoreResource({ id: webpageResource.id });
    // Restore returns a Draft — silently resurrecting a public URL would be surprising
    const publication = await webpageCaller.readResourcePublication({ id: webpageResource.id });

    expect(publication).toBeUndefined();
  });

  test("restores a resource out of the bin", async () => {
    expect.hasAssertions();

    const dashboardResource = await dashboardCaller.createResource({ name });
    await caller.deleteResources({ ids: [dashboardResource.id] });
    const restoredResource = await caller.restoreResource({ id: dashboardResource.id });
    const liveCount = await caller.readResourcesCount();
    const deletedCount = await caller.readDeletedResourcesCount();

    expect(restoredResource.deletedAt).toBeNull();
    expect(liveCount).toBe(1);
    expect(deletedCount).toBe(0);
  });

  test("does not restore a resource that is not in the bin", async () => {
    expect.hasAssertions();

    const dashboardResource = await dashboardCaller.createResource({ name });

    await expect(caller.restoreResource({ id: dashboardResource.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test("lists every published snapshot with the latest marked current", async () => {
    expect.hasAssertions();

    const webpageResource = await webpageCaller.createResource({ name });
    await saveWebpageContent(webpageResource, webpageEditor);
    await webpageCaller.publishResource({ id: webpageResource.id });
    await webpageCaller.publishResource({ id: webpageResource.id });
    const versions = await caller.readSnapshotHistory({ id: webpageResource.id });

    // The blob lastModified timestamp is non-deterministic, so only version + current are asserted
    expect(
      versions
        .map(({ isCurrent, version }) => ({ isCurrent, version }))
        .toSorted((firstVersion, secondVersion) => firstVersion.version - secondVersion.version),
    ).toStrictEqual([
      { isCurrent: false, version: 1 },
      { isCurrent: true, version: 2 },
    ]);
  });

  test("reads empty publish history for an unpublished resource", async () => {
    expect.hasAssertions();

    const webpageResource = await webpageCaller.createResource({ name });
    const versions = await caller.readSnapshotHistory({ id: webpageResource.id });

    expect(versions).toStrictEqual([]);
  });

  test("restores a published version into the working draft", async () => {
    expect.hasAssertions();

    const webpageResource = await webpageCaller.createResource({ name });
    await saveWebpageContent(webpageResource, webpageEditor);
    await webpageCaller.publishResource({ id: webpageResource.id });
    await saveWebpageContent(webpageResource, new WebpageEditor({ css: "b", html: "b" }), 1);
    const { resource: restoredResource } = await caller.restoreSnapshotVersion({
      channel: SnapshotChannel.Published,
      id: webpageResource.id,
      version: 1,
    });
    const content = await webpageCaller.readResourceContent({ id: webpageResource.id });
    const publication = await webpageCaller.readResourcePublication({ id: webpageResource.id });

    // The v1 snapshot's content is copied back into the working copy, contentVersion advances, and the
    // Publication is never re-pointed — restore produces a Draft
    expect(content).toStrictEqual(jsonDateParse(JSON.stringify(webpageEditor)));
    expect(restoredResource.contentVersion).toBe(webpageResource.contentVersion + 3);
    expect(publication?.publishVersion).toBe(1);
  });

  test("restores a published version through the one content-write path", async () => {
    expect.hasAssertions();

    const webpageResource = await webpageCaller.createResource({ name });
    // The rowKey is the write's own reverse-ticked timestamp, so the pinned clock has to move between the
    // Mutations for their entries to land on distinct keys instead of colliding in the partition
    vi.advanceTimersByTime(1);
    await saveWebpageContent(webpageResource, webpageEditor);
    await waitForSynchronizedFunctions();
    vi.advanceTimersByTime(1);
    await webpageCaller.publishResource({ id: webpageResource.id });
    await waitForSynchronizedFunctions();
    vi.advanceTimersByTime(1);
    let saveEvent: undefined | { content: unknown; contentVersion: Resource["contentVersion"]; id: Resource["id"] };
    resourceEventEmitter.on("saveResourceContent", ([data]) => {
      saveEvent = data;
    });
    const { resource: restoredResource } = await caller.restoreSnapshotVersion({
      channel: SnapshotChannel.Published,
      id: webpageResource.id,
      version: 1,
    });
    await waitForSynchronizedFunctions();
    const { items } = await caller.readActivities({ id: webpageResource.id });
    assert.exists(saveEvent);

    expect(saveEvent.id).toBe(webpageResource.id);
    expect(saveEvent.contentVersion).toBe(restoredResource.contentVersion);
    expect(saveEvent.content).toStrictEqual(jsonDateParse(JSON.stringify(webpageEditor)));
    expect(
      items
        .map(({ activityType }) => activityType)
        .toSorted((firstValue, secondValue) => EN_US_COMPARATOR.compare(firstValue, secondValue)),
    ).toStrictEqual(
      [
        ResourceActivityType.ContentSaved,
        ResourceActivityType.Created,
        ResourceActivityType.Published,
        ResourceActivityType.Restored,
      ].toSorted((firstValue, secondValue) => EN_US_COMPARATOR.compare(firstValue, secondValue)),
    );
  });

  // Both channels number from 1, so a restore taking a version without the channel it belongs to would read the
  // Published snapshot whenever a revision shares its number, silently discarding the point the owner picked
  test("restores the revision a version names rather than the published snapshot of that number", async () => {
    expect.hasAssertions();

    const webpageResource = await webpageCaller.createResource({ name });
    await saveWebpageContent(webpageResource, webpageEditor);
    await webpageCaller.publishResource({ id: webpageResource.id });
    const revisionEditor = new WebpageEditor({ css: "b", html: "b" });
    await saveWebpageContent(webpageResource, revisionEditor, 1);
    await caller.saveResourceRevision({ id: webpageResource.id });
    await saveWebpageContent(webpageResource, new WebpageEditor({ css: "c", html: "c" }), 2);
    await caller.restoreSnapshotVersion({ channel: SnapshotChannel.Revisions, id: webpageResource.id, version: 1 });
    const content = await webpageCaller.readResourceContent({ id: webpageResource.id });

    expect(content).toStrictEqual(jsonDateParse(JSON.stringify(revisionEditor)));
  });

  test("restores a revision without cloning the assets it already points at", async () => {
    expect.hasAssertions();

    const webpageResource = await webpageCaller.createResource({ name });
    const blobName = `${getFilesDirectoryName(webpageResource.id)}/${crypto.randomUUID()}${ID_SEPARATOR}${filename}`;
    MockContainerDatabase.set(AzureContainer.ResourceAssets, new Map([[blobName, Buffer.alloc(1)]]));
    await saveWebpageContent(
      webpageResource,
      new WebpageEditor({ css: "a", html: `<img src="${getResourceAssetUrl(blobName)}">` }),
    );
    await caller.saveResourceRevision({ id: webpageResource.id });
    await saveWebpageContent(webpageResource, webpageEditor, 1);
    await caller.restoreSnapshotVersion({ channel: SnapshotChannel.Revisions, id: webpageResource.id, version: 1 });
    const content = await webpageCaller.readResourceContent({ id: webpageResource.id });
    assert.exists(content);

    expect(content.html).toBe(`<img src="${getResourceAssetUrl(blobName)}">`);
    expect(readFilesBlobNames(webpageResource.id)).toStrictEqual([blobName]);
  });

  // The version the undo took rides back with the restore, because a listing afterwards cannot say which of its
  // Rows this restore had just taken
  test(`${SnapshotReason.BeforeRestore}: the draft a restore replaces is restorable afterwards`, async () => {
    expect.hasAssertions();

    const webpageResource = await webpageCaller.createResource({ name });
    await saveWebpageContent(webpageResource, webpageEditor);
    await webpageCaller.publishResource({ id: webpageResource.id });
    const draftEditor = new WebpageEditor({ css: "b", html: "b" });
    await saveWebpageContent(webpageResource, draftEditor, 1);
    const { undoRevisionVersion } = await caller.restoreSnapshotVersion({
      channel: SnapshotChannel.Published,
      id: webpageResource.id,
      version: 1,
    });
    assert.exists(undoRevisionVersion);
    await caller.restoreSnapshotVersion({
      channel: SnapshotChannel.Revisions,
      id: webpageResource.id,
      version: undoRevisionVersion,
    });
    const content = await webpageCaller.readResourceContent({ id: webpageResource.id });

    expect(undoRevisionVersion).toBe(1);
    expect(content).toStrictEqual(jsonDateParse(JSON.stringify(draftEditor)));
  });

  test("does not save a labelled revision for a reason the owner did not choose", async () => {
    expect.hasAssertions();

    const webpageResource = await webpageCaller.createResource({ name });

    await expect(caller.saveResourceRevision({ id: webpageResource.id, label, reason: SnapshotReason.BeforeImport }))
      .rejects.toThrowErrorMatchingInlineSnapshot(`
      [TRPCError: [
        {
          "code": "custom",
          "path": [],
          "message": "A label is only accepted on a Manual revision"
        }
      ]]
    `);
  });

  test("records the draft version a publish was taken from", async () => {
    expect.hasAssertions();

    const webpageResource = await webpageCaller.createResource({ name });
    await saveWebpageContent(webpageResource, webpageEditor);
    await webpageCaller.publishResource({ id: webpageResource.id });
    const publication = await webpageCaller.readResourcePublication({ id: webpageResource.id });

    expect(publication?.publishedContentVersion).toBe(webpageResource.contentVersion + 1);
  });

  test("does not read publish history for another user's resource", async () => {
    expect.hasAssertions();

    await mockSessionOnce(mockContext.db);
    const otherUserResource = await webpageCaller.createResource({ name });

    await expect(caller.readSnapshotHistory({ id: otherUserResource.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test("does not restore a version of another user's resource", async () => {
    expect.hasAssertions();

    await mockSessionOnce(mockContext.db);
    const otherUserResource = await webpageCaller.createResource({ name });

    await expect(
      caller.restoreSnapshotVersion({ channel: SnapshotChannel.Published, id: otherUserResource.id, version: 1 }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("purges a binned resource for good", async () => {
    expect.hasAssertions();

    const dashboardResource = await dashboardCaller.createResource({ name });
    // Drained before the purge, so the sweep is proved against a partition that has a row in it
    await waitForSynchronizedFunctions();
    await caller.deleteResources({ ids: [dashboardResource.id] });
    await caller.purgeResource({ id: dashboardResource.id });
    const deletedCount = await caller.readDeletedResourcesCount();
    // The row is gone, so the blade can no longer resolve it — the partition is swept at purge time,
    // Read straight from the table because no procedure can reach a purged resource any more
    const activityEntities = [...(MockTableDatabase.get(AzureTable.ResourceActivity)?.values() ?? [])];

    expect(deletedCount).toBe(0);
    expect(activityEntities).toStrictEqual([]);
  });

  // Ordering is Azure's own partitionKey+rowKey contract, which MockTableClient does not reproduce
  // (it yields insertion order), so these assert the trail's contents and its reverse-ticked keys
  // Rather than the delivered order.
  test("records an activity trail", async () => {
    expect.hasAssertions();

    const dashboardResource = await dashboardCaller.createResource({ name });
    vi.advanceTimersByTime(1);
    await dashboardCaller.updateResource({ id: dashboardResource.id, name: "renamed" });
    await waitForSynchronizedFunctions();
    const { items } = await caller.readActivities({ id: dashboardResource.id });
    const renamedActivity = items.find(({ activityType }) => activityType === ResourceActivityType.Renamed);

    expect(
      items
        .map(({ activityType }) => activityType)
        .toSorted((firstValue, secondValue) => EN_US_COMPARATOR.compare(firstValue, secondValue)),
    ).toStrictEqual(
      [ResourceActivityType.Renamed, ResourceActivityType.Created].toSorted((firstValue, secondValue) =>
        EN_US_COMPARATOR.compare(firstValue, secondValue),
      ),
    );
    expect(renamedActivity?.oldName).toBe(name);
    expect(renamedActivity?.newName).toBe("renamed");
  });

  test("writes a descending rowKey per activity so a partition scan reads newest-first", async () => {
    expect.hasAssertions();

    const dashboardResource = await dashboardCaller.createResource({ name });
    vi.advanceTimersByTime(1);
    await dashboardCaller.updateResource({ id: dashboardResource.id, name: "renamed" });
    await waitForSynchronizedFunctions();
    const { items } = await caller.readActivities({ id: dashboardResource.id });
    const createdActivity = items.find(({ activityType }) => activityType === ResourceActivityType.Created);
    const renamedActivity = items.find(({ activityType }) => activityType === ResourceActivityType.Renamed);

    // Reverse-ticked: the later event carries the smaller key, so ascending rowKey is newest-first
    expect(renamedActivity?.rowKey.localeCompare(createdActivity?.rowKey ?? "")).toBeLessThan(0);
  });

  // A tag edit carries nothing but the tags, so it can neither trip the rename trail nor overwrite the name a
  // Concurrent rename just wrote
  test("does not record an activity for a tags-only update", async () => {
    expect.hasAssertions();

    const dashboardResource = await dashboardCaller.createResource({ name });
    await dashboardCaller.updateResource({ id: dashboardResource.id, tags: { env: "prod" } });
    await waitForSynchronizedFunctions();
    const { items } = await caller.readActivities({ id: dashboardResource.id });
    const updatedResource = await caller.readResource({ id: dashboardResource.id });

    expect(items.map(({ activityType }) => activityType)).toStrictEqual([ResourceActivityType.Created]);
    expect(updatedResource.name).toBe(name);
  });

  test("coalesces repeated content saves by the same user within the hour", async () => {
    expect.hasAssertions();

    const webpageResource = await webpageCaller.createResource({ name });
    vi.advanceTimersByTime(1);
    await saveWebpageContent(webpageResource, webpageEditor);
    // Drained before the clock moves, so the next save's coalescing scan sees this entry
    await waitForSynchronizedFunctions();
    vi.advanceTimersByTime(1);
    await saveWebpageContent(webpageResource, webpageEditor, 1);
    await waitForSynchronizedFunctions();
    const { items } = await caller.readActivities({ id: webpageResource.id });

    expect(
      items
        .map(({ activityType }) => activityType)
        .toSorted((firstValue, secondValue) => EN_US_COMPARATOR.compare(firstValue, secondValue)),
    ).toStrictEqual(
      [ResourceActivityType.ContentSaved, ResourceActivityType.Created].toSorted((firstValue, secondValue) =>
        EN_US_COMPARATOR.compare(firstValue, secondValue),
      ),
    );
  });

  test("records a content save once the coalesce window has passed", async () => {
    expect.hasAssertions();

    const webpageResource = await webpageCaller.createResource({ name });
    vi.advanceTimersByTime(1);
    await saveWebpageContent(webpageResource, webpageEditor);
    // Drained before the clock moves, so the next save's coalescing scan sees this entry
    await waitForSynchronizedFunctions();
    vi.advanceTimersByTime(CONTENT_SAVED_COALESCE_WINDOW_MS + 1);
    await saveWebpageContent(webpageResource, webpageEditor, 1);
    await waitForSynchronizedFunctions();
    const { items } = await caller.readActivities({ id: webpageResource.id });

    expect(
      items
        .map(({ activityType }) => activityType)
        .toSorted((firstValue, secondValue) => EN_US_COMPARATOR.compare(firstValue, secondValue)),
    ).toStrictEqual(
      [ResourceActivityType.ContentSaved, ResourceActivityType.ContentSaved, ResourceActivityType.Created].toSorted(
        (firstValue, secondValue) => EN_US_COMPARATOR.compare(firstValue, secondValue),
      ),
    );
  });
});
