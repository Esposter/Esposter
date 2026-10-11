import { describe, expect, test } from "vitest";

import { serializeStrictTransportSecurity } from "#src/runtime/services/serializeStrictTransportSecurity";

describe(serializeStrictTransportSecurity, () => {
  const MAX_AGE = 63072000;

  test("an options object serialises as one valid header value", () => {
    expect.hasAssertions();

    expect(serializeStrictTransportSecurity({ includeSubdomains: true, maxAge: MAX_AGE, preload: false })).toBe(
      `max-age=${MAX_AGE}; includeSubDomains`,
    );
  });

  test("preload is appended when it is set", () => {
    expect.hasAssertions();

    expect(serializeStrictTransportSecurity({ includeSubdomains: true, maxAge: MAX_AGE, preload: true })).toBe(
      `max-age=${MAX_AGE}; includeSubDomains; preload`,
    );
  });
});
