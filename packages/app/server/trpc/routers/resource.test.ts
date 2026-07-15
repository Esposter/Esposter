import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, mockSessionOnce } from "@@/server/trpc/context.test";
import { CONTENT_SAVED_COALESCE_WINDOW_MS } from "@@/server/services/resource/constants";
import { dashboardRouter } from "@@/server/trpc/routers/dashboard";
import { resourceRouter } from "@@/server/trpc/routers/resource";
import { sheetRouter } from "@@/server/trpc/routers/sheet";
import { webpageRouter } from "@@/server/trpc/routers/webpage";
import { AzureTable, ResourceActivityType, resources, ResourceType } from "@esposter/db-schema";
import { jsonDateParse, takeOne } from "@esposter/shared";
import { MockContainerDatabase, MockTableDatabase } from "azure-mock";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

describe("resource", () => {
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRPCRouter["resource"]>;
  let dashboardCaller: DecorateRouterRecord<TRPCRouter["dashboard"]>;
  let sheetCaller: DecorateRouterRecord<TRPCRouter["sheet"]>;
  let webpageCaller: DecorateRouterRecord<TRPCRouter["webpage"]>;
  const name = "name";
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

    expect(items.map(({ id }) => id).toSorted()).toStrictEqual([dashboardResource.id, sheetResource.id].toSorted());
    expect(items.map(({ type }) => type).toSorted()).toStrictEqual(
      [ResourceType.Dashboard, ResourceType.Sheet].toSorted(),
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

    expect(deletedResources.map(({ id }) => id).toSorted()).toStrictEqual(
      [dashboardResource.id, sheetResource.id].toSorted(),
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
    await webpageCaller.saveResourceContent({
      content: webpageEditor,
      contentVersion: webpageResource.contentVersion,
      id: webpageResource.id,
    });
    await webpageCaller.publishResource({ id: webpageResource.id });
    const duplicatedResource = await caller.duplicateResource({ id: webpageResource.id });
    const content = await webpageCaller.readResourceContent({ id: duplicatedResource.id });
    const publication = await webpageCaller.readResourcePublication({ id: duplicatedResource.id });

    expect(duplicatedResource.id).not.toBe(webpageResource.id);
    expect(duplicatedResource.name).toBe(`${name} (copy)`);
    expect(duplicatedResource.type).toBe(ResourceType.Webpage);
    expect(content).toStrictEqual(jsonDateParse(JSON.stringify(webpageEditor)));
    expect(publication).toBeUndefined();
  });

  test("duplicates a resource without content", async () => {
    expect.hasAssertions();

    const dashboardResource = await dashboardCaller.createResource({ name });
    const duplicatedResource = await caller.duplicateResource({ id: dashboardResource.id });
    const content = await dashboardCaller.readResourceContent({ id: duplicatedResource.id });

    expect(duplicatedResource.name).toBe(`${name} (copy)`);
    expect(content).toBeUndefined();
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

  test("purges a binned resource for good", async () => {
    expect.hasAssertions();

    const dashboardResource = await dashboardCaller.createResource({ name });
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
  // rather than the delivered order.
  test("records an activity trail", async () => {
    expect.hasAssertions();

    const dashboardResource = await dashboardCaller.createResource({ name });
    vi.advanceTimersByTime(1);
    await dashboardCaller.updateResource({ id: dashboardResource.id, name: "renamed" });
    const { items } = await caller.readActivities({ id: dashboardResource.id });
    const renamedActivity = items.find(({ activityType }) => activityType === ResourceActivityType.Renamed);

    expect(items.map(({ activityType }) => activityType).toSorted()).toStrictEqual(
      [ResourceActivityType.Renamed, ResourceActivityType.Created].toSorted(),
    );
    expect(renamedActivity?.oldName).toBe(name);
    expect(renamedActivity?.newName).toBe("renamed");
  });

  test("writes a descending rowKey per activity so a partition scan reads newest-first", async () => {
    expect.hasAssertions();

    const dashboardResource = await dashboardCaller.createResource({ name });
    vi.advanceTimersByTime(1);
    await dashboardCaller.updateResource({ id: dashboardResource.id, name: "renamed" });
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
    vi.advanceTimersByTime(1);
    await webpageCaller.saveResourceContent({
      content: webpageEditor,
      contentVersion: webpageResource.contentVersion + 1,
      id: webpageResource.id,
    });
    const { items } = await caller.readActivities({ id: webpageResource.id });

    expect(items.map(({ activityType }) => activityType).toSorted()).toStrictEqual(
      [ResourceActivityType.ContentSaved, ResourceActivityType.Created].toSorted(),
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
    vi.advanceTimersByTime(CONTENT_SAVED_COALESCE_WINDOW_MS + 1);
    await webpageCaller.saveResourceContent({
      content: webpageEditor,
      contentVersion: webpageResource.contentVersion + 1,
      id: webpageResource.id,
    });
    const { items } = await caller.readActivities({ id: webpageResource.id });

    expect(items.map(({ activityType }) => activityType).toSorted()).toStrictEqual(
      [ResourceActivityType.ContentSaved, ResourceActivityType.ContentSaved, ResourceActivityType.Created].toSorted(),
    );
  });
});
