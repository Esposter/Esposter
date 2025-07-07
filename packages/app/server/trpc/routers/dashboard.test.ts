import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { MockContainerClientMap } from "@@/server/composables/azure/useContainerClient.test";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { dashboardRouter } from "@@/server/trpc/routers/dashboard";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("dashboard", () => {
  let caller: DecorateRouterRecord<TRPCRouter["dashboard"]>;

  beforeAll(async () => {
    const createCaller = createCallerFactory(dashboardRouter);
    const mockContext = await createMockContext();
    caller = createCaller(mockContext);
  });

  afterEach(() => {
    MockContainerClientMap.clear();
  });

  test("reads", async () => {
    expect.hasAssertions();

    const dashboard = await caller.readDashboard();
    const { createdAt, id, updatedAt } = dashboard;

    expect(dashboard).toStrictEqual(new Dashboard({ createdAt, id, updatedAt }));
  });

  test("saves and reads", async () => {
    expect.hasAssertions();

    const dashboard = new Dashboard();
    await caller.saveDashboard(dashboard);
    const readDashboard = await caller.readDashboard();

    expect(readDashboard).toStrictEqual(dashboard);
  });
});
