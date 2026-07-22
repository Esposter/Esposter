import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor";
import { EN_US_COMPARATOR } from "#shared/services/intl/constants";
import { getFilesDirectoryName } from "#shared/services/resource/getFilesDirectoryName";
import { getResourceAssetUrl } from "#shared/services/resource/getResourceAssetUrl";
import { waitForSynchronizedFunctions } from "#shared/util/function/getSynchronizedFunction";
import { CONTENT_SAVED_COALESCE_WINDOW_MS } from "@@/server/services/resource/constants";
import { getContentBlobName } from "@@/server/services/resource/getContentBlobName";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, mockSessionOnce } from "@@/server/trpc/context.test";
import { dashboardRouter } from "@@/server/trpc/routers/dashboard";
import { resourceRouter } from "@@/server/trpc/routers/resource";
import { sheetRouter } from "@@/server/trpc/routers/sheet";
import { webpageRouter } from "@@/server/trpc/routers/webpage";
import { AzureContainer, AzureTable, ResourceActivityType, resources, ResourceType } from "@esposter/db-schema";
import { ID_SEPARATOR, jsonDateParse, takeOne } from "@esposter/shared";
import { MockContainerDatabase, MockTableDatabase } from "azure-mock";
import { afterEach, assert, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

describe("resource", () => {
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRPCRouter["resource"]>;
  let dashboardCaller: DecorateRouterRecord<TRPCRouter["dashboard"]>;
  let sheetCaller: DecorateRouterRecord<TRPCRouter["sheet"]>;
  let webpageCaller: DecorateRouterRecord<TRPCRouter["webpage"]>;
  const name = "name";
  const filename = "filename";
  const webpageEditor = new WebpageEditor({ css: "a", html: "a" });

  beforeAll(async () => {
    mockContext = await createMockContext();
    caller = createCallerFactory(resourceRouter)(mockContext);
    dashboardCaller = createCallerFactory(dashboardRouter)(mockContext);
    sheetCaller = createCallerFactory(sheetRouter)(mockContext);
    webpageCaller = createCallerFactory(webpageRouter)(mockContext);
  });

  // UpdatedAt is populated by drizzle's $onUpdateFn(() => new Date()), so faking Date makes recency deterministic
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });

  afterEach(async () => {
    vi.useRealTimers();
    MockContainerDatabase.clear();
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
    const readResource = await caller.readResource({ id: dashboardResource.id });

    expect(readResource).toStrictEqual(dashboardResource);
  });

  test("reads resources across every type", async () => {
    expect.hasAssertions();

    const dashboardResource = await dashboardCaller.createResource({ name });
    const sheetResource = await sheetCaller.createResource({ name });
    const { items } = await caller.readResources();

    expect(items.map(({ id }) => id).toSorted((a, b) => EN_US_COMPARATOR.compare(a, b))).toStrictEqual(
      [dashboardResource.id, sheetResource.id].toSorted((a, b) => EN_US_COMPARATOR.compare(a, b)),
    );
    expect(items.map(({ type }) => type).toSorted((a, b) => EN_US_COMPARATOR.compare(a, b))).toStrictEqual(
      [ResourceType.Dashboard, ResourceType.Sheet].toSorted((a, b) => EN_US_COMPARATOR.compare(a, b)),
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

    const count = await caller.count();

    expect(count).toBe(2);
  });

  test("counts resources filtered by type", async () => {
    expect.hasAssertions();

    await dashboardCaller.createResource({ name });
    await sheetCaller.createResource({ name });

    const count = await caller.count({ types: [ResourceType.Dashboard] });

    expect(count).toBe(1);
  });

  test("counts resources filtered by search query", async () => {
    expect.hasAssertions();

    await dashboardCaller.createResource({ name: "quarterly report" });
    await sheetCaller.createResource({ name: "grocery list" });

    const count = await caller.count({ searchQuery: "report" });

    expect(count).toBe(1);
  });

  test("counts resources grouped by type", async () => {
    expect.hasAssertions();

    await dashboardCaller.createResource({ name });
    await sheetCaller.createResource({ name });
    await sheetCaller.createResource({ name });

    const countsByType = await caller.countsByType();

    // Ordered by count desc, so the busiest type leads the summary cards
    expect(countsByType).toStrictEqual([
      { count: 2, type: ResourceType.Sheet },
      { count: 1, type: ResourceType.Dashboard },
    ]);
  });

  test("omits types with no resources from the grouped count", async () => {
    expect.hasAssertions();

    await dashboardCaller.createResource({ name });

    const countsByType = await caller.countsByType();

    expect(countsByType).toStrictEqual([{ count: 1, type: ResourceType.Dashboard }]);
  });

  test("counts grouped by type filtered by search query", async () => {
    expect.hasAssertions();

    await dashboardCaller.createResource({ name: "quarterly report" });
    await sheetCaller.createResource({ name: "grocery list" });

    const countsByType = await caller.countsByType({ searchQuery: "report" });

    expect(countsByType).toStrictEqual([{ count: 1, type: ResourceType.Dashboard }]);
  });

  test("counts grouped by type only for the caller's own resources", async () => {
    expect.hasAssertions();

    await mockSessionOnce(mockContext.db);
    await dashboardCaller.createResource({ name });
    await sheetCaller.createResource({ name });

    const countsByType = await caller.countsByType();

    expect(countsByType).toStrictEqual([{ count: 1, type: ResourceType.Sheet }]);
  });

  test("filters resources by published status", async () => {
    expect.hasAssertions();

    const webpageResource = await webpageCaller.createResource({ name });
    await webpageCaller.saveResourceContent({
      content: webpageEditor,
      contentVersion: webpageResource.contentVersion,
      id: webpageResource.id,
    });
    await webpageCaller.publishResource({ id: webpageResource.id });
    const draftResource = await dashboardCaller.createResource({ name });
    const { items: publishedItems } = await caller.readResources({ isPublished: true });
    const { items: draftItems } = await caller.readResources({ isPublished: false });
    const publishedCount = await caller.count({ isPublished: true });

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
    const count = await caller.count();

    expect(deletedResources.map(({ id }) => id).toSorted((a, b) => EN_US_COMPARATOR.compare(a, b))).toStrictEqual(
      [dashboardResource.id, sheetResource.id].toSorted((a, b) => EN_US_COMPARATOR.compare(a, b)),
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

  test("duplicates a resource with content as a draft copy", async () => {
    expect.hasAssertions();

    const webpageResource = await webpageCaller.createResource({ name });
    const blobName = `${getFilesDirectoryName(webpageResource.id)}/${crypto.randomUUID()}${ID_SEPARATOR}${filename}`;
    MockContainerDatabase.set(AzureContainer.ResourceAssets, new Map([[blobName, Buffer.alloc(1)]]));
    await webpageCaller.saveResourceContent({
      content: new WebpageEditor({ css: "a", html: `<img src="${getResourceAssetUrl(blobName)}">` }),
      contentVersion: webpageResource.contentVersion,
      id: webpageResource.id,
    });
    await webpageCaller.publishResource({ id: webpageResource.id });
    const duplicatedResource = await caller.duplicateResource({ id: webpageResource.id });
    const content = await webpageCaller.readResourceContent({ id: duplicatedResource.id });
    assert.exists(content);

    const publication = await webpageCaller.readResourcePublication({ id: duplicatedResource.id });
    // The copy owns its assets: the same file segment is cloned under the new id and the url rewritten to it
    const duplicatedBlobName = `${duplicatedResource.id}/${blobName.slice(`${webpageResource.id}/`.length)}`;

    expect(duplicatedResource.id).not.toBe(webpageResource.id);
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

    const duplicatedBlobName = `${duplicatedResource.id}/${blobName.slice(`${webpageResource.id}/`.length)}`;
    const container = MockContainerDatabase.get(AzureContainer.ResourceAssets);
    assert(container);

    // The existing asset is cloned and rewritten; the dangling url is data, carried verbatim instead of
    // Failing the whole clone
    expect(content.html).toBe(
      `<img src="${getResourceAssetUrl(duplicatedBlobName)}"><img src="${getResourceAssetUrl(missingBlobName)}">`,
    );
    expect(container.has(duplicatedBlobName)).toBe(true);
  });

  test("cleans up the copy when duplicating its content fails", async () => {
    expect.hasAssertions();

    const webpageResource = await webpageCaller.createResource({ name });
    await webpageCaller.saveResourceContent({
      content: webpageEditor,
      contentVersion: webpageResource.contentVersion,
      id: webpageResource.id,
    });
    // Corrupt the stored draft so reading it back for the copy fails after the copy's row already exists
    const container = MockContainerDatabase.get(AzureContainer.ResourceAssets);
    assert(container);
    container.set(getContentBlobName(webpageResource.id), Buffer.from("a"));

    await expect(caller.duplicateResource({ id: webpageResource.id })).rejects.toThrowErrorMatchingInlineSnapshot();

    const { items } = await caller.readResources();

    // The copy is fully reverted: no row and no blobs outside the original's directory
    expect(items.map(({ id }) => id)).toStrictEqual([webpageResource.id]);
    expect([...container.keys()].every((key) => key.startsWith(`${webpageResource.id}/`))).toBe(true);
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
    const tagCount = await caller.count({ tags: { env: "prod" } });

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
    const deletedCount = await caller.countDeletedResources();
    const liveCount = await caller.count();

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
    await webpageCaller.saveResourceContent({
      content: webpageEditor,
      contentVersion: webpageResource.contentVersion,
      id: webpageResource.id,
    });
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
    const liveCount = await caller.count();
    const deletedCount = await caller.countDeletedResources();

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
    await webpageCaller.saveResourceContent({
      content: webpageEditor,
      contentVersion: webpageResource.contentVersion,
      id: webpageResource.id,
    });
    await webpageCaller.publishResource({ id: webpageResource.id });
    await webpageCaller.publishResource({ id: webpageResource.id });
    const versions = await caller.readPublishHistory({ id: webpageResource.id });

    // The blob lastModified timestamp is non-deterministic, so only version + current are asserted
    expect(
      versions.map(({ isCurrent, version }) => ({ isCurrent, version })).toSorted((a, b) => a.version - b.version),
    ).toStrictEqual([
      { isCurrent: false, version: 1 },
      { isCurrent: true, version: 2 },
    ]);
  });

  test("reads empty publish history for an unpublished resource", async () => {
    expect.hasAssertions();

    const webpageResource = await webpageCaller.createResource({ name });
    const versions = await caller.readPublishHistory({ id: webpageResource.id });

    expect(versions).toStrictEqual([]);
  });

  test("restores a published version into the working draft", async () => {
    expect.hasAssertions();

    const webpageResource = await webpageCaller.createResource({ name });
    await webpageCaller.saveResourceContent({
      content: webpageEditor,
      contentVersion: webpageResource.contentVersion,
      id: webpageResource.id,
    });
    await webpageCaller.publishResource({ id: webpageResource.id });
    await webpageCaller.saveResourceContent({
      content: new WebpageEditor({ css: "b", html: "b" }),
      contentVersion: webpageResource.contentVersion + 1,
      id: webpageResource.id,
    });
    const restoredResource = await caller.restorePublishedVersion({ id: webpageResource.id, version: 1 });
    const content = await webpageCaller.readResourceContent({ id: webpageResource.id });
    const publication = await webpageCaller.readResourcePublication({ id: webpageResource.id });

    // The v1 snapshot's content is copied back into the working copy, contentVersion advances, and the
    // Publication is never re-pointed — restore produces a Draft
    expect(content).toStrictEqual(jsonDateParse(JSON.stringify(webpageEditor)));
    expect(restoredResource.contentVersion).toBe(webpageResource.contentVersion + 3);
    expect(publication?.publishVersion).toBe(1);
  });

  test("does not read publish history for another user's resource", async () => {
    expect.hasAssertions();

    await mockSessionOnce(mockContext.db);
    const otherUserResource = await webpageCaller.createResource({ name });

    await expect(caller.readPublishHistory({ id: otherUserResource.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test("does not restore a version of another user's resource", async () => {
    expect.hasAssertions();

    await mockSessionOnce(mockContext.db);
    const otherUserResource = await webpageCaller.createResource({ name });

    await expect(
      caller.restorePublishedVersion({ id: otherUserResource.id, version: 1 }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });

  test("purges a binned resource for good", async () => {
    expect.hasAssertions();

    const dashboardResource = await dashboardCaller.createResource({ name });
    // The Created write is fire-and-forget, so drain it before purge to prove purge sweeps the partition
    await waitForSynchronizedFunctions();
    await caller.deleteResources({ ids: [dashboardResource.id] });
    await caller.purgeResource({ id: dashboardResource.id });
    const deletedCount = await caller.countDeletedResources();
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
    // Both the Created and Renamed writes are fire-and-forget off the mutation, so drain them first
    await waitForSynchronizedFunctions();
    const { items } = await caller.readActivities({ id: dashboardResource.id });
    const renamedActivity = items.find(({ activityType }) => activityType === ResourceActivityType.Renamed);

    expect(
      items.map(({ activityType }) => activityType).toSorted((a, b) => EN_US_COMPARATOR.compare(a, b)),
    ).toStrictEqual(
      [ResourceActivityType.Renamed, ResourceActivityType.Created].toSorted((a, b) => EN_US_COMPARATOR.compare(a, b)),
    );
    expect(renamedActivity?.oldName).toBe(name);
    expect(renamedActivity?.newName).toBe("renamed");
  });

  test("writes a descending rowKey per activity so a partition scan reads newest-first", async () => {
    expect.hasAssertions();

    const dashboardResource = await dashboardCaller.createResource({ name });
    vi.advanceTimersByTime(1);
    await dashboardCaller.updateResource({ id: dashboardResource.id, name: "renamed" });
    // Both the Created and Renamed writes are fire-and-forget off the mutation, so drain them first
    await waitForSynchronizedFunctions();
    const { items } = await caller.readActivities({ id: dashboardResource.id });
    const createdActivity = items.find(({ activityType }) => activityType === ResourceActivityType.Created);
    const renamedActivity = items.find(({ activityType }) => activityType === ResourceActivityType.Renamed);

    // Reverse-ticked: the later event carries the smaller key, so ascending rowKey is newest-first
    expect(renamedActivity?.rowKey.localeCompare(createdActivity?.rowKey ?? "")).toBeLessThan(0);
  });

  test("does not record an activity for a tags-only update", async () => {
    expect.hasAssertions();

    const dashboardResource = await dashboardCaller.createResource({ name });
    await dashboardCaller.updateResource({ id: dashboardResource.id, name, tags: { env: "prod" } });
    // The Created write is fire-and-forget off createResource, so drain it before reading the trail
    await waitForSynchronizedFunctions();
    const { items } = await caller.readActivities({ id: dashboardResource.id });

    expect(items.map(({ activityType }) => activityType)).toStrictEqual([ResourceActivityType.Created]);
  });

  test("coalesces repeated content saves by the same user within the hour", async () => {
    expect.hasAssertions();

    const webpageResource = await webpageCaller.createResource({ name });
    vi.advanceTimersByTime(1);
    await webpageCaller.saveResourceContent({
      content: webpageEditor,
      contentVersion: webpageResource.contentVersion,
      id: webpageResource.id,
    });
    // The activity write is fire-and-forget off the save path, so drain it before the next save's
    // Coalescing scan can even see it
    await waitForSynchronizedFunctions();
    vi.advanceTimersByTime(1);
    await webpageCaller.saveResourceContent({
      content: webpageEditor,
      contentVersion: webpageResource.contentVersion + 1,
      id: webpageResource.id,
    });
    await waitForSynchronizedFunctions();
    const { items } = await caller.readActivities({ id: webpageResource.id });

    expect(
      items.map(({ activityType }) => activityType).toSorted((a, b) => EN_US_COMPARATOR.compare(a, b)),
    ).toStrictEqual(
      [ResourceActivityType.ContentSaved, ResourceActivityType.Created].toSorted((a, b) =>
        EN_US_COMPARATOR.compare(a, b),
      ),
    );
  });

  test("records a content save once the coalesce window has passed", async () => {
    expect.hasAssertions();

    const webpageResource = await webpageCaller.createResource({ name });
    vi.advanceTimersByTime(1);
    await webpageCaller.saveResourceContent({
      content: webpageEditor,
      contentVersion: webpageResource.contentVersion,
      id: webpageResource.id,
    });
    // The activity write is fire-and-forget off the save path, so drain it before the next save's
    // Coalescing scan can even see it
    await waitForSynchronizedFunctions();
    vi.advanceTimersByTime(CONTENT_SAVED_COALESCE_WINDOW_MS + 1);
    await webpageCaller.saveResourceContent({
      content: webpageEditor,
      contentVersion: webpageResource.contentVersion + 1,
      id: webpageResource.id,
    });
    await waitForSynchronizedFunctions();
    const { items } = await caller.readActivities({ id: webpageResource.id });

    expect(
      items.map(({ activityType }) => activityType).toSorted((a, b) => EN_US_COMPARATOR.compare(a, b)),
    ).toStrictEqual(
      [ResourceActivityType.ContentSaved, ResourceActivityType.ContentSaved, ResourceActivityType.Created].toSorted(
        (a, b) => EN_US_COMPARATOR.compare(a, b),
      ),
    );
  });
});
