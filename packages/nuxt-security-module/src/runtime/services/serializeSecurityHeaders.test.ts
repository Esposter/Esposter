import { serializeSecurityHeaders } from "#src/runtime/services/serializeSecurityHeaders";
import { getDefaultSecurityHeaders } from "#src/services/getDefaultSecurityHeaders";
import { describe, expect, test } from "vitest";

describe(serializeSecurityHeaders, () => {
  const DEFAULT_HEADERS = getDefaultSecurityHeaders(false, false);

  test("a header set to false is not sent at all", () => {
    expect.hasAssertions();

    expect(serializeSecurityHeaders({ ...DEFAULT_HEADERS, xFrameOptions: false })).not.toHaveProperty(
      "X-Frame-Options",
    );
  });

  test("each header's value is written from its option", () => {
    expect.hasAssertions();

    const headers = serializeSecurityHeaders(DEFAULT_HEADERS);
    expect(headers["Cross-Origin-Embedder-Policy"]).toBe("credentialless");
    expect(headers["Referrer-Policy"]).toBe("no-referrer");
    expect(headers["Strict-Transport-Security"]).toBe("max-age=63072000; includeSubDomains");
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["X-Frame-Options"]).toBe("SAMEORIGIN");
  });

  test("the X-XSS-Protection header is not sent, since browsers no longer read it", () => {
    expect.hasAssertions();

    expect(serializeSecurityHeaders(DEFAULT_HEADERS)).not.toHaveProperty("X-XSS-Protection");
  });
});
