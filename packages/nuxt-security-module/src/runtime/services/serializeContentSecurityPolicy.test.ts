import { describe, expect, test } from "vitest";

import { serializeContentSecurityPolicy } from "#src/runtime/services/serializeContentSecurityPolicy";

describe(serializeContentSecurityPolicy, () => {
  test("#432 a directive set to false is left out of the policy", () => {
    expect.hasAssertions();

    expect(serializeContentSecurityPolicy({ "default-src": ["'self'"], "img-src": false })).toBe("default-src 'self';");
  });

  test("#214 upgrade-insecure-requests set to false is omitted, and set to true it is the bare directive", () => {
    expect.hasAssertions();

    expect(serializeContentSecurityPolicy({ "upgrade-insecure-requests": false })).toBe("");
    expect(serializeContentSecurityPolicy({ "upgrade-insecure-requests": true })).toBe("upgrade-insecure-requests;");
  });

  test("directives are joined, each with its sources", () => {
    expect.hasAssertions();

    expect(serializeContentSecurityPolicy({ "default-src": ["'self'"], "img-src": ["'self'", "data:"] })).toBe(
      "default-src 'self'; img-src 'self' data:;",
    );
  });
});
