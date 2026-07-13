import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, mockSessionOnce } from "@@/server/trpc/context.test";
import { dashboardRouter } from "@@/server/trpc/routers/dashboard";
import { fileRouter } from "@@/server/trpc/routers/file";
import { resourceRouter } from "@@/server/trpc/routers/resource";
import { webpageRouter } from "@@/server/trpc/routers/webpage";
import { resources, ResourceType } from "@esposter/db-schema";
import { jsonDateParse } from "@esposter/shared";
import { MockContainerDatabase } from "azure-mock";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

describe("resource", () => {
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRPCRouter["resource"]>;
  let dashboardCaller: DecorateRouterRecord<TRPCRouter["dashboard"]>;
  let fileCaller: DecorateRouterRecord<TRPCRouter["file"]>;
  let webpageCaller: DecorateRouterRecord<TRPCRouter["webpage"]>;
  const name = "name";
  const webpageEditor = new WebpageEditor({ css: "a", html: "a" });

  beforeAll(async () => {
    mockContext = await createMockContext();
    caller = createCallerFactory(resourceRouter)(mockContext);
    dashboardCaller = createCallerFactory(dashboardRouter)(mockContext);
    fileCaller = createCallerFactory(fileRouter)(mockContext);
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
    const fileResource = await fileCaller.createResource({ name });
    const { items } = await caller.readResources();

    expect(items.map(({ id }) => id).toSorted()).toStrictEqual([dashboardResource.id, fileResource.id].toSorted());
    expect(items.map(({ type }) => type).toSorted()).toStrictEqual(
      [ResourceType.Dashboard, ResourceType.File].toSorted(),
    );
  });

  test("filters resources by type", async () => {
    expect.hasAssertions();

    const dashboardResource = await dashboardCaller.createResource({ name });
    await fileCaller.createResource({ name });
    const { items } = await caller.readResources({ types: [ResourceType.Dashboard] });

    expect(items.map(({ id }) => id)).toStrictEqual([dashboardResource.id]);
  });

  test("filters resources by search query", async () => {
    expect.hasAssertions();

    const matchingResource = await dashboardCaller.createResource({ name: "quarterly report" });
    await fileCaller.createResource({ name: "grocery list" });
    const { items } = await caller.readResources({ searchQuery: "report" });

    expect(items.map(({ id }) => id)).toStrictEqual([matchingResource.id]);
  });

  test("ranks prefix matches before substring matches", async () => {
    expect.hasAssertions();

    // The prefix match is created first (older), so without ranking the newer substring match would come first
    const prefixResource = await dashboardCaller.createResource({ name: `${name} a` });
    vi.advanceTimersByTime(1);
    const substringResource = await fileCaller.createResource({ name: `a ${name}` });
    const { items } = await caller.readResources({ searchQuery: name });

    expect(items.map(({ id }) => id)).toStrictEqual([prefixResource.id, substringResource.id]);
  });

  test("orders by updatedAt desc within a match tier", async () => {
    expect.hasAssertions();

    const olderResource = await dashboardCaller.createResource({ name });
    vi.advanceTimersByTime(1);
    const newerResource = await fileCaller.createResource({ name });
    const { items } = await caller.readResources({ searchQuery: name });

    expect(items.map(({ id }) => id)).toStrictEqual([newerResource.id, olderResource.id]);
  });

  test("counts resources across every type", async () => {
    expect.hasAssertions();

    await dashboardCaller.createResource({ name });
    await fileCaller.createResource({ name });

    const count = await caller.count();

    expect(count).toBe(2);
  });

  test("counts resources filtered by type", async () => {
    expect.hasAssertions();

    await dashboardCaller.createResource({ name });
    await fileCaller.createResource({ name });

    const count = await caller.count({ types: [ResourceType.Dashboard] });

    expect(count).toBe(1);
  });

  test("counts resources filtered by search query", async () => {
    expect.hasAssertions();

    await dashboardCaller.createResource({ name: "quarterly report" });
    await fileCaller.createResource({ name: "grocery list" });

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
    const newerResource = await fileCaller.createResource({ name });
    const { items: updatedAfterItems } = await caller.readResources({ updatedAfter: new Date(1) });
    const { items: updatedBeforeItems } = await caller.readResources({ updatedBefore: new Date(0) });

    expect(updatedAfterItems.map(({ id }) => id)).toStrictEqual([newerResource.id]);
    expect(updatedBeforeItems.map(({ id }) => id)).toStrictEqual([olderResource.id]);
  });

  test("deletes resources in bulk", async () => {
    expect.hasAssertions();

    const dashboardResource = await dashboardCaller.createResource({ name });
    const fileResource = await fileCaller.createResource({ name });
    const deletedResources = await caller.deleteResources({ ids: [dashboardResource.id, fileResource.id] });
    const count = await caller.count();

    expect(deletedResources.map(({ id }) => id).toSorted()).toStrictEqual(
      [dashboardResource.id, fileResource.id].toSorted(),
    );
    expect(count).toBe(0);
  });

  test("does not delete other users' resources in bulk", async () => {
    expect.hasAssertions();

    await mockSessionOnce(mockContext.db);
    const otherUserResource = await dashboardCaller.createResource({ name });
    const ownResource = await fileCaller.createResource({ name });
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
});
