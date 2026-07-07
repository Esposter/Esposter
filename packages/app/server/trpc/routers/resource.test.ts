import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { dashboardRouter } from "@@/server/trpc/routers/dashboard";
import { resourceRouter } from "@@/server/trpc/routers/resource";
import { tableEditorRouter } from "@@/server/trpc/routers/tableEditor";
import { resources, ResourceType } from "@esposter/db-schema";
import { MockContainerDatabase } from "azure-mock";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("resource", () => {
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRPCRouter["resource"]>;
  let dashboardCaller: DecorateRouterRecord<TRPCRouter["dashboard"]>;
  let tableEditorCaller: DecorateRouterRecord<TRPCRouter["tableEditor"]>;
  const name = "name";

  beforeAll(async () => {
    mockContext = await createMockContext();
    caller = createCallerFactory(resourceRouter)(mockContext);
    dashboardCaller = createCallerFactory(dashboardRouter)(mockContext);
    tableEditorCaller = createCallerFactory(tableEditorRouter)(mockContext);
  });

  afterEach(async () => {
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
    const tableResource = await tableEditorCaller.createResource({ name });
    const { items } = await caller.readResources();

    expect(items.map(({ id }) => id).toSorted()).toStrictEqual([dashboardResource.id, tableResource.id].toSorted());
    expect(items.map(({ type }) => type).toSorted()).toStrictEqual(
      [ResourceType.Dashboard, ResourceType.Table].toSorted(),
    );
  });

  test("filters resources by type", async () => {
    expect.hasAssertions();

    const dashboardResource = await dashboardCaller.createResource({ name });
    await tableEditorCaller.createResource({ name });
    const { items } = await caller.readResources({ types: [ResourceType.Dashboard] });

    expect(items.map(({ id }) => id)).toStrictEqual([dashboardResource.id]);
  });

  test("filters resources by search query", async () => {
    expect.hasAssertions();

    const matchingResource = await dashboardCaller.createResource({ name: "quarterly report" });
    await tableEditorCaller.createResource({ name: "grocery list" });
    const { items } = await caller.readResources({ searchQuery: "report" });

    expect(items.map(({ id }) => id)).toStrictEqual([matchingResource.id]);
  });

  test("counts resources across every type", async () => {
    expect.hasAssertions();

    await dashboardCaller.createResource({ name });
    await tableEditorCaller.createResource({ name });

    const count = await caller.count();

    expect(count).toBe(2);
  });

  test("counts resources filtered by type", async () => {
    expect.hasAssertions();

    await dashboardCaller.createResource({ name });
    await tableEditorCaller.createResource({ name });

    const count = await caller.count({ types: [ResourceType.Dashboard] });

    expect(count).toBe(1);
  });

  test("counts resources filtered by search query", async () => {
    expect.hasAssertions();

    await dashboardCaller.createResource({ name: "quarterly report" });
    await tableEditorCaller.createResource({ name: "grocery list" });

    const count = await caller.count({ searchQuery: "report" });

    expect(count).toBe(1);
  });
});
