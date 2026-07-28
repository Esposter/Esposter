import { getIsRateLimitExceeded } from "@@/server/services/rateLimiter/getIsRateLimitExceeded";
import { toAppError } from "@esposter/shared";
import { RateLimiterRes } from "rate-limiter-flexible";
import { describe, expect, test } from "vitest";

describe(getIsRateLimitExceeded, () => {
  test("matches the rejection as thrown", () => {
    expect.hasAssertions();

    expect(getIsRateLimitExceeded(new RateLimiterRes())).toBe(true);
  });

  test("matches the rejection after a neverthrow boundary wrapped it", () => {
    expect.hasAssertions();

    // The form every consumer actually sees: every getResult/getResultAsync boundary passes the rejection through
    // `toAppError`, and `RateLimiterRes` is not an `Error`, so what arrives is a wrapper holding it as its cause
    expect(getIsRateLimitExceeded(toAppError(new RateLimiterRes()))).toBe(true);
  });

  test("does not match any other failure", () => {
    expect.hasAssertions();

    expect(getIsRateLimitExceeded(new Error(" "))).toBe(false);
  });
});
