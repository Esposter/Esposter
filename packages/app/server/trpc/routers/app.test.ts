import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { appRouter } from "@@/server/trpc/routers/app";
import { beforeEach, describe, expect, test } from "vitest";

describe("appRouter", () => {
  let caller: DecorateRouterRecord<TRPCRouter["app"]>;

  beforeEach(() => {
    const createCaller = createCallerFactory(appRouter);
    const mockContext = createMockContext();
    caller = createCaller(mockContext);
  });

  test("buildVersion", async () => {
    expect.hasAssertions();

    const buildVersion = await caller.buildVersion();

    expect(buildVersion).toBeTypeOf("number");
  });
});
