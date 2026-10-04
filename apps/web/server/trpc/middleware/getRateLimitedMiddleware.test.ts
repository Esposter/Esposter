import type { Context } from "#server/trpc/context";

import { authMocks } from "#server/auth.test";
import { RateLimiterType } from "#server/models/rateLimiter/RateLimiterType";
import { getAgentSessionPayload } from "#server/services/auth/getAgentSessionPayload";
import { RateLimiterMap } from "#server/services/rateLimiter/RateLimiterMap";
import { createCallerFactory, publicProcedure, router } from "#server/trpc";
import { createMockContext, getMockSession, mockNoSessionOnce } from "#server/trpc/context.test";
import { getRateLimitedMiddleware } from "#server/trpc/middleware/getRateLimitedMiddleware";
import { noop } from "@esposter/shared";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

// The middleware only enforces in production, a module-level fact, so it is stubbed rather than simulated
vi.mock(import("#shared/util/environment/constants"), async (importOriginal) => ({
  ...(await importOriginal()),
  IS_PRODUCTION: true,
}));

describe(getRateLimitedMiddleware, () => {
  const testRouter = router({
    ping: publicProcedure.use(getRateLimitedMiddleware(RateLimiterType.Standard)).query<boolean>(() => true),
  });
  const createTestCaller = createCallerFactory(testRouter);

  let mockContext: Context;
  let caller: ReturnType<typeof createTestCaller>;

  beforeAll(async () => {
    // The branch under test is the one taken when no address can be resolved
    mockContext = { ...(await createMockContext()), ipAddress: "" };
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
    vi.spyOn(console, "warn").mockImplementation(noop);
    mockNoSessionOnce();

    await caller.ping();

    expect(consume).not.toHaveBeenCalled();
  });

  // The MCP route authenticates an API key's owner itself, and the cookie a command-line client sends is none
  test("takes a session the context carries without reading the cookie", async () => {
    expect.hasAssertions();

    const { user } = getMockSession();
    const consume = vi
      .spyOn(RateLimiterMap[RateLimiterType.Standard], "consume")
      .mockResolvedValue({ msBeforeNext: 0, remainingPoints: 1 } as Awaited<
        ReturnType<(typeof RateLimiterMap)[RateLimiterType.Standard]["consume"]>
      >);

    await createTestCaller({ ...mockContext, getSessionPayload: getAgentSessionPayload(user, "") }).ping();

    expect(consume).toHaveBeenCalledExactlyOnceWith(user.id);
    expect(authMocks.getSession).not.toHaveBeenCalled();
  });
});
