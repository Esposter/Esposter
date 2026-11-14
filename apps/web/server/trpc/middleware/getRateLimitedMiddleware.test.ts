import type { Context } from "#server/trpc/context";

import { authMocks } from "#server/auth.test";
import { RateLimiterType } from "#server/models/rateLimiter/RateLimiterType";
import { getAgentSessionPayload } from "#server/services/auth/getAgentSessionPayload";
import { createCallerFactory, publicProcedure, router } from "#server/trpc";
import { createMockContext, getMockSession, mockNoSessionOnce } from "#server/trpc/context.test";
import { getRateLimitedMiddleware } from "#server/trpc/middleware/getRateLimitedMiddleware";
import { noop } from "@esposter/shared";
import { env } from "cloudflare:workers";
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

  test("refuses an authed caller whose key the binding has spent", async () => {
    expect.hasAssertions();

    const limit = vi
      .fn<(options: RateLimitOptions) => Promise<RateLimitOutcome>>()
      .mockResolvedValue({ success: false });
    env.RATE_LIMITER_STANDARD = { limit };

    await expect(caller.ping()).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: TOO_MANY_REQUESTS]`);

    expect(limit).toHaveBeenCalledExactlyOnceWith({ key: getMockSession().user.id });
  });

  test("passes an authed caller whose key the binding still has budget for", async () => {
    expect.hasAssertions();

    const limit = vi
      .fn<(options: RateLimitOptions) => Promise<RateLimitOutcome>>()
      .mockResolvedValue({ success: true });
    env.RATE_LIMITER_STANDARD = { limit };

    await expect(caller.ping()).resolves.toBe(true);

    expect(limit).toHaveBeenCalledExactlyOnceWith({ key: getMockSession().user.id });
  });

  test("keys an anonymous caller on its procedure path and address", async () => {
    expect.hasAssertions();

    const limit = vi
      .fn<(options: RateLimitOptions) => Promise<RateLimitOutcome>>()
      .mockResolvedValue({ success: true });
    env.RATE_LIMITER_STANDARD = { limit };
    mockNoSessionOnce();

    await expect(createTestCaller({ ...mockContext, ipAddress: "203.0.113.5" }).ping()).resolves.toBe(true);

    expect(limit).toHaveBeenCalledExactlyOnceWith({ key: "ping|203.0.113.5" });
  });

  test("bypasses an anonymous caller with no resolvable address", async () => {
    expect.hasAssertions();

    const limit = vi
      .fn<(options: RateLimitOptions) => Promise<RateLimitOutcome>>()
      .mockResolvedValue({ success: false });
    env.RATE_LIMITER_STANDARD = { limit };
    vi.spyOn(console, "warn").mockImplementation(noop);
    mockNoSessionOnce();

    await caller.ping();

    expect(limit).not.toHaveBeenCalled();
  });

  // The MCP route authenticates an API key's owner itself, and the cookie a command-line client sends is none
  test("takes a session the context carries without reading the cookie", async () => {
    expect.hasAssertions();

    const { user } = getMockSession();
    const limit = vi
      .fn<(options: RateLimitOptions) => Promise<RateLimitOutcome>>()
      .mockResolvedValue({ success: true });
    env.RATE_LIMITER_STANDARD = { limit };

    await createTestCaller({ ...mockContext, getSessionPayload: getAgentSessionPayload(user, "") }).ping();

    expect(limit).toHaveBeenCalledExactlyOnceWith({ key: user.id });
    expect(authMocks.getSession).not.toHaveBeenCalled();
  });
});
