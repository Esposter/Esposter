import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { appRouter } from "@@/server/trpc/routers/app";
import { beforeAll, describe, expect, test, vi } from "vitest";

vi.mock(import("#shared/util/github/getCommitCount"), () => ({
  getCommitCount: vi.fn<() => Promise<number>>(() => Promise.resolve(0)),
}));

describe("appRouter", () => {
  let caller: DecorateRouterRecord<TRPCRouter["app"]>;

  beforeAll(async () => {
    const mockContext = await createMockContext();
    caller = createCallerFactory(appRouter)(mockContext);
  });

  test("buildVersion", async () => {
    expect.hasAssertions();

    const buildVersion = await caller.buildVersion();

    expect(buildVersion).toBe(0);
  });
});
