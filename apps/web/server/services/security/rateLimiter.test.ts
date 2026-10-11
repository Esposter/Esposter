import type { NitroApp } from "nitro/types";

import { createApp, defineEventHandler, toWebHandler } from "nitro/h3";
import { createRouteRulesPlugin } from "nuxt-security-module/runtime/nitro/plugins/routeRules";
import rateLimiter from "nuxt-security-module/runtime/server/middleware/rateLimiter";
import { describe, expect, test } from "vitest";

const URL = "http://localhost/api";
const SOCKET_ADDRESS = "203.0.113.5";
const INTERVAL_IN_MILLISECONDS = 60_000;
const TOKENS_PER_INTERVAL = 1;

// The module's route rules, resolved the way its Nitro plugin resolves them at startup. The plugin's only dependency
// on the app is the hook it calls, which has no listener here
const resolveRouteRules = async () =>
  createRouteRulesPlugin({
    "/**": {
      enabled: true,
      rateLimiter: { intervalInMilliseconds: INTERVAL_IN_MILLISECONDS, tokensPerInterval: TOKENS_PER_INTERVAL },
    },
  })({ hooks: { callHook: () => Promise.resolve() } } as unknown as NitroApp);

// A real h3 app serves the module's middleware, the handler behind it is the one a request reaches once it passes
const createHandler = () => {
  const app = createApp();
  app.use(rateLimiter);
  app.use(defineEventHandler(() => "ok"));
  return toWebHandler(app);
};

// The socket address is the connection's, which a client cannot write, unlike its own forwarded header
const createRequest = (forwardedFor: string) =>
  Object.assign(new Request(URL, { headers: { "x-forwarded-for": forwardedFor } }), { ip: SOCKET_ADDRESS });

describe("nuxt-security-module rateLimiter", () => {
  test("#83 #196 a forwarded address the client writes does not change its key, so it cannot spend a fresh count", async () => {
    expect.hasAssertions();

    await resolveRouteRules();
    const handler = createHandler();

    expect((await handler(createRequest("198.51.100.1"))).status).toBe(200);
    expect((await handler(createRequest("198.51.100.2"))).status).toBe(429);
  });
});
