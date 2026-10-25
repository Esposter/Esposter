import { getDefaultModuleOptions } from "#src/services/getDefaultModuleOptions";
import { getDefaultSecurityHeaders } from "#src/services/getDefaultSecurityHeaders";
import { assert, describe, expect, test } from "vitest";

describe(getDefaultModuleOptions, () => {
  const DEV_SERVER_URL = "http://localhost:3000";

  test("the default CORS origin is the development server's, never a wildcard", () => {
    expect.hasAssertions();

    expect(getDefaultModuleOptions(false, DEV_SERVER_URL, false).corsHandler).toStrictEqual({
      methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
      origin: DEV_SERVER_URL,
      preflight: { statusCode: 204 },
    });
  });

  test("the framework's X-Powered-By header is hidden by default", () => {
    expect.hasAssertions();

    expect(getDefaultModuleOptions(false, DEV_SERVER_URL, false).hidePoweredBy).toBe(true);
  });

  test("strict mode's default script-src has no host or unsafe-inline fallback, so only nonced scripts run", () => {
    expect.hasAssertions();

    const { contentSecurityPolicy } = getDefaultSecurityHeaders(false, true);
    if (!contentSecurityPolicy) assert.fail("the default policy is disabled");

    expect(contentSecurityPolicy["script-src"]).toStrictEqual(["'self'", "'strict-dynamic'", "'nonce-{{nonce}}'"]);
  });
});
