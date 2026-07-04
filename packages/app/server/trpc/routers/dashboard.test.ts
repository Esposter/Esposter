import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { dashboardRouter } from "@@/server/trpc/routers/dashboard";
import { MockContainerDatabase } from "azure-mock";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

// The generic blob-state matrix lives in webpageEditor.test.ts; here only the wiring.
describe("dashboard", () => {
  let caller: DecorateRouterRecord<TRPCRouter["dashboard"]>;

  beforeAll(async () => {
    const mockContext = await createMockContext();
    caller = createCallerFactory(dashboardRouter)(mockContext);
  });

  afterEach(() => {
    MockContainerDatabase.clear();
  });

  test("saves and reads", async () => {
    expect.hasAssertions();

    const dashboard = new Dashboard();
    await caller.saveDashboard(dashboard);
    const readDashboard = await caller.readDashboard();

    expect(readDashboard).toStrictEqual(dashboard);
  });
});
