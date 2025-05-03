import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { dashboardRouter } from "@@/server/trpc/routers/dashboard";
import { beforeEach, describe, expect, test } from "vitest";

describe("dashboard", () => {
  let caller: DecorateRouterRecord<TRPCRouter["dashboard"]>;

  beforeEach(() => {
    const createCaller = createCallerFactory(dashboardRouter);
    const mockContext = createMockContext();
    caller = createCaller(mockContext);
  });

  test("read", async () => {
    expect.hasAssertions();

    const dashboard = await caller.readDashboard();
    const { createdAt, id } = dashboard;

    expect(dashboard).toStrictEqual(new Dashboard({ createdAt, id, updatedAt: createdAt }));
  });

  test.todo("save and read", async () => {
    expect.hasAssertions();

    const dashboard = new Dashboard();
    await caller.saveDashboard(dashboard);
    const readDashboard = await caller.readDashboard();

    expect(readDashboard).toStrictEqual(dashboard);
  });
});
