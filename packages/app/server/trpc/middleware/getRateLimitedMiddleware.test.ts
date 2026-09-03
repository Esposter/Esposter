import type { Context } from "@@/server/trpc/context";

import { RateLimiterType } from "@@/server/models/rateLimiter/RateLimiterType";
import { RateLimiterMap } from "@@/server/services/rateLimiter/RateLimiterMap";
import { createCallerFactory, publicProcedure, router } from "@@/server/trpc";
import { createMockContext, getMockSession, mockNoSessionOnce } from "@@/server/trpc/context.test";
import { getRateLimitedMiddleware } from "@@/server/trpc/middleware/getRateLimitedMiddleware";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

// The middleware only enforces in production, and the branch under test is the one taken when no address can be
// Resolved — both are module-level facts, so they are stubbed rather than simulated.
vi.mock(import("#shared/util/environment/constants"), async (importOriginal) => ({
  ...(await importOriginal()),
  IS_PRODUCTION: true,
}));
vi.mock(import("@@/server/services/request/getIpAddress"), () => ({ getIpAddress: () => undefined }));

describe(getRateLimitedMiddleware, () => {
  const testRouter = router({
    ping: publicProcedure.use(getRateLimitedMiddleware(RateLimiterType.Standard)).query(() => true),
  });
  const createTestCaller = createCallerFactory(testRouter);

  let mockContext: Context;
  let caller: ReturnType<typeof createTestCaller>;

  beforeAll(async () => {
    mockContext = await createMockContext();
    caller = createTestCaller(mockContext);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("consumes a point for an authed caller with no resolvable address", async () => {
    expect.hasAssertions();

    const consume = vi
      .spyOn(RateLimiterMap[RateLimiterType.Standard], "consume")
      .mockResolvedValue({ msBeforeNext: 0, remainingPoints: 1 } as Awaited<
        ReturnType<(typeof RateLimiterMap)[RateLimiterType.Standard]["consume"]>
      >);

    await caller.ping();

    expect(consume).toHaveBeenCalledExactlyOnceWith(getMockSession().user.id);
  });

  test("bypasses an anonymous caller with no resolvable address", async () => {
    expect.hasAssertions();

    const consume = vi.spyOn(RateLimiterMap[RateLimiterType.Standard], "consume");
    vi.spyOn(console, "warn").mockReturnValue(undefined);
    mockNoSessionOnce();

    await caller.ping();

    expect(consume).not.toHaveBeenCalled();
  });
});
