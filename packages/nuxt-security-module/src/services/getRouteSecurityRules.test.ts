import type { SecurityRouteRules } from "#src/models/SecurityRouteRules";

import { getDefaultModuleOptions } from "#src/services/getDefaultModuleOptions";
import { getRouteSecurityRules } from "#src/services/getRouteSecurityRules";
import { describe, expect, test } from "vitest";

describe(getRouteSecurityRules, () => {
  const DEV_SERVER_URL = "http://localhost:3000";
  const ROUTE = "/api/**";
  const RATE_LIMITER = { intervalInMilliseconds: 60_000, tokensPerInterval: 10 };
  const options = getDefaultModuleOptions(false, DEV_SERVER_URL, false);

  test("a route rule's security key is kept under its route, and a route with none adds no entry", () => {
    expect.hasAssertions();

    expect(
      getRouteSecurityRules({ "/": {}, [ROUTE]: { security: { rateLimiter: RATE_LIMITER } } }, options),
    ).toStrictEqual({ [ROUTE]: { rateLimiter: RATE_LIMITER } });
  });

  test("basicAuth is refused in a route rule, so no credential is written into a route the requests read", () => {
    expect.hasAssertions();

    const security: SecurityRouteRules = { basicAuth: { name: "user", pass: "secret" } };

    expect(() => getRouteSecurityRules({ [ROUTE]: { security } }, options)).toThrowErrorMatchingInlineSnapshot(
      `[TypeError: nuxt-security-module: route /api/**: basicAuth cannot be set in a route rule]`,
    );
  });

  test("a route's option that breaks its schema is refused with the route it is on", () => {
    expect.hasAssertions();

    const security = { rateLimiter: { intervalInMilliseconds: 0, tokensPerInterval: 10 } };

    expect(() => getRouteSecurityRules({ [ROUTE]: { security } }, options)).toThrowErrorMatchingInlineSnapshot(
      `[TypeError: nuxt-security-module: route /api/**: rateLimiter.intervalInMilliseconds: must be more than zero milliseconds]`,
    );
  });
});
