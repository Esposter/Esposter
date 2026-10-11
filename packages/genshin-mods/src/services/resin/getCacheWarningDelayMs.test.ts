import { describe, expect, test } from "vitest";

import { CACHE_LIFETIME_MS, CACHE_WARNING_MS } from "../constants";
import { getCacheWarningDelayMs } from "./getCacheWarningDelayMs";

describe(getCacheWarningDelayMs, () => {
  const ONE_MINUTE_MILLISECONDS = Temporal.Duration.from({ minutes: 1 }).total("milliseconds");
  const REQUEST_AT = Temporal.Duration.from({ hours: 2 }).total("milliseconds");

  test("is nothing while no request has read or written the cache", () => {
    expect.hasAssertions();

    expect(getCacheWarningDelayMs(0, REQUEST_AT)).toBeUndefined();
  });

  test("is the time until the cache goes cold less the warning margin", () => {
    expect.hasAssertions();

    expect(getCacheWarningDelayMs(REQUEST_AT, REQUEST_AT)).toBe(CACHE_LIFETIME_MS - CACHE_WARNING_MS);
  });

  test("is due at once once the warning margin has been reached", () => {
    expect.hasAssertions();

    expect(
      getCacheWarningDelayMs(REQUEST_AT, REQUEST_AT + CACHE_LIFETIME_MS - CACHE_WARNING_MS + ONE_MINUTE_MILLISECONDS),
    ).toBe(0);
  });
});
