import { RATE_LIMITER_BYPASS_LOG_MESSAGE } from "#server/services/rateLimiter/constants";
import { consumeAddressRateLimit } from "#server/services/rateLimiter/consumeAddressRateLimit";
import { noop } from "@esposter/shared";
import { env } from "cloudflare:workers";
import { afterEach, describe, expect, test, vi } from "vitest";

// The helper only enforces in production, a module-level fact, so it is stubbed rather than simulated
vi.mock(import("#shared/util/environment/constants"), async (importOriginal) => ({
  ...(await importOriginal()),
  IS_PRODUCTION: true,
}));

describe(consumeAddressRateLimit, () => {
  const address = "0.0.0.0";

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("spends a point from the budget of the address it is given and lets an address within it through", async () => {
    expect.hasAssertions();

    const limit = vi
      .fn<(options: RateLimitOptions) => Promise<RateLimitOutcome>>()
      .mockResolvedValue({ success: true });
    env.RATE_LIMITER_ADDRESS = { limit };

    await expect(consumeAddressRateLimit(address)).resolves.toBe(true);

    expect(limit).toHaveBeenCalledExactlyOnceWith({ key: address });
  });

  test("refuses an address whose budget is spent", async () => {
    expect.hasAssertions();

    const limit = vi
      .fn<(options: RateLimitOptions) => Promise<RateLimitOutcome>>()
      .mockResolvedValue({ success: false });
    env.RATE_LIMITER_ADDRESS = { limit };

    await expect(consumeAddressRateLimit(address)).resolves.toBe(false);

    expect(limit).toHaveBeenCalledExactlyOnceWith({ key: address });
  });

  test("bypasses an address that cannot be determined, with a warning", async () => {
    expect.hasAssertions();

    // Refusing every call, so a bypass removed from the helper reaches the binding and fails here
    const limit = vi
      .fn<(options: RateLimitOptions) => Promise<RateLimitOutcome>>()
      .mockResolvedValue({ success: false });
    env.RATE_LIMITER_ADDRESS = { limit };
    const warn = vi.spyOn(console, "warn").mockImplementation(noop);

    await expect(consumeAddressRateLimit("")).resolves.toBe(true);

    expect(limit).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledExactlyOnceWith(RATE_LIMITER_BYPASS_LOG_MESSAGE);
  });
});
