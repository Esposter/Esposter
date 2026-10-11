import { getDefaultSecurityHeaders } from "#src/services/getDefaultSecurityHeaders";
import { getStaticResourceHeaders } from "#src/services/getStaticResourceHeaders";
import { describe, expect, test } from "vitest";

describe(getStaticResourceHeaders, () => {
  test("a static resource carries the headers that are not page-only, and no page policy", () => {
    expect.hasAssertions();

    expect(getStaticResourceHeaders(getDefaultSecurityHeaders(false, false))).toStrictEqual({
      "Referrer-Policy": "no-referrer",
      "Strict-Transport-Security": "max-age=63072000; includeSubDomains",
      "X-Content-Type-Options": "nosniff",
      "X-Download-Options": "noopen",
      "X-Frame-Options": "SAMEORIGIN",
      "X-Permitted-Cross-Domain-Policies": "none",
    });
  });
});
