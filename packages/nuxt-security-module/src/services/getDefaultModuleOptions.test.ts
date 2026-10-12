import { describe, expect, test } from "vitest";

import { getDefaultModuleOptions } from "#src/services/getDefaultModuleOptions";

describe(getDefaultModuleOptions, () => {
  const DEV_SERVER_URL = "http://localhost:3000";

  test("#118 the default CORS origin is the development server's, never a wildcard", () => {
    expect.hasAssertions();

    expect(getDefaultModuleOptions(false, DEV_SERVER_URL).corsHandler).toStrictEqual({
      methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
      origin: DEV_SERVER_URL,
      preflight: { statusCode: 204 },
    });
  });

  test("the framework's X-Powered-By header is hidden by default", () => {
    expect.hasAssertions();

    expect(getDefaultModuleOptions(false, DEV_SERVER_URL).hidePoweredBy).toBe(true);
  });
});
