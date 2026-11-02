import { addressRateLimiter } from "#server/services/rateLimiter/addressRateLimiter";
import { RATE_LIMITER_BYPASS_LOG_MESSAGE } from "#server/services/rateLimiter/constants";
import { consumeAddressRateLimit } from "#server/services/rateLimiter/consumeAddressRateLimit";
import { noop } from "@esposter/shared";
import { RateLimiterRes } from "rate-limiter-flexible";
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

  test("spends a point from the budget of the address it is given", async () => {
    expect.hasAssertions();

    const consume = vi.spyOn(addressRateLimiter, "consume").mockResolvedValue(new RateLimiterRes());

    await consumeAddressRateLimit(address);

    expect(consume).toHaveBeenCalledExactlyOnceWith(address);
  });

  test("bypasses an address that cannot be determined, with a warning", async () => {
    expect.hasAssertions();

    // Mocked so that a bypass removed from the helper reaches the stub and fails here, rather than the database
    const consume = vi.spyOn(addressRateLimiter, "consume").mockResolvedValue(new RateLimiterRes());
    const warn = vi.spyOn(console, "warn").mockImplementation(noop);

    await consumeAddressRateLimit("");

    expect(consume).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledExactlyOnceWith(RATE_LIMITER_BYPASS_LOG_MESSAGE);
  });
});
