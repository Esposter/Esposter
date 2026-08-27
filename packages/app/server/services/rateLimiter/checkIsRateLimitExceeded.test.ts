import { checkIsRateLimitExceeded } from "@@/server/services/rateLimiter/checkIsRateLimitExceeded";
import { toAppError } from "@esposter/shared";
import { RateLimiterRes } from "rate-limiter-flexible";
import { describe, expect, test } from "vitest";

describe(checkIsRateLimitExceeded, () => {
  test("matches the rejection as thrown", () => {
    expect.hasAssertions();

    expect(checkIsRateLimitExceeded(new RateLimiterRes())).toBe(true);
  });

  test("matches the rejection after a neverthrow boundary wrapped it", () => {
    expect.hasAssertions();

    // The form every consumer actually sees: every getResult/getResultAsync boundary passes the rejection through
    // `toAppError`, and `RateLimiterRes` is not an `Error`, so what arrives is a wrapper holding it as its cause
    expect(checkIsRateLimitExceeded(toAppError(new RateLimiterRes()))).toBe(true);
  });

  test("does not match any other failure", () => {
    expect.hasAssertions();

    expect(checkIsRateLimitExceeded(new Error(" "))).toBe(false);
  });
});
