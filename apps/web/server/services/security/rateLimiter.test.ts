import { resolveRouteRules } from "#server/services/security/resolveRouteRules.test";
import { defineEventHandler, H3 } from "nitro/h3";
import rateLimiter from "nuxt-security-module/runtime/server/middleware/rateLimiter";
import { describe, expect, test } from "vitest";

describe("nuxt-security-module rateLimiter", () => {
  const URL = "http://localhost/api";

  const SOCKET_ADDRESS = "203.0.113.5";

  const INTERVAL_IN_MILLISECONDS = 60_000;

  const TOKENS_PER_INTERVAL = 1;

  // The socket address is the connection's, which a client cannot write, unlike its own forwarded header
  const createRequest = (forwardedFor: string) =>
    Object.assign(new Request(URL, { headers: { "x-forwarded-for": forwardedFor } }), { ip: SOCKET_ADDRESS });

  test("#83 #196 a forwarded address the client writes does not change its key, so it cannot spend a fresh count", async () => {
    expect.hasAssertions();

    // The module's route rules, resolved the way its Nitro plugin resolves them on the first request. The plugin's only
    // Dependencies on the app are the request hook it registers and the routeRules hook it calls, which has no listener
    // Here
    await resolveRouteRules({
      "/**": {
        enabled: true,
        rateLimiter: { intervalInMilliseconds: INTERVAL_IN_MILLISECONDS, tokensPerInterval: TOKENS_PER_INTERVAL },
      },
    });

    // A real h3 app serves the module's middleware, and the handler behind it answers a request that passes
    const app = new H3();
    app.use(rateLimiter);
    app.use(defineEventHandler(() => "ok"));

    expect((await app.fetch(createRequest("198.51.100.1"))).status).toBe(200);
    expect((await app.fetch(createRequest("198.51.100.2"))).status).toBe(429);
  });
});
