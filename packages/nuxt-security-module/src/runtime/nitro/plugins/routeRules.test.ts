import { ROUTE_RULES_HOOK, SECURITY_HEADER_NAMES } from "#src/runtime/constants";
import {
  createNitroApp,
  createPageEvent,
  PAGE_CONTENT_SECURITY_POLICY,
  PAGE_ROUTE_RULES,
} from "#src/runtime/nitro/plugins/page.fixture";
import { createRouteRulesPlugin } from "#src/runtime/nitro/plugins/routeRules";
import securityHeaders from "#src/runtime/nitro/plugins/securityHeaders";
import { describe, expect, test } from "vitest";

describe(createRouteRulesPlugin, () => {
  test("a route's header the app's routeRules hook changes reaches that route's response", async () => {
    expect.hasAssertions();

    const app = createNitroApp();
    // The module's plugins are registered before the app's own server plugins, so the hook has its listener only after this plugin's setup
    createRouteRulesPlugin(PAGE_ROUTE_RULES)(app.nitroApp);
    securityHeaders(app.nitroApp);
    app.nitroApp.hooks.hook(ROUTE_RULES_HOOK, (routeRules) => {
      routeRules["/docs/**"] = {
        headers: {
          contentSecurityPolicy: { ...PAGE_CONTENT_SECURITY_POLICY, "img-src": ["'self'", "data:", "https:"] },
        },
      };
    });

    const event = createPageEvent();
    await app.nitroApp.hooks.callHook("request", event);
    app.run("render:route", {}, { event });

    expect(event.res.headers.get(SECURITY_HEADER_NAMES.contentSecurityPolicy)).toBe(
      "base-uri 'self'; connect-src 'self'; default-src 'self'; font-src 'self'; form-action 'self'; frame-ancestors 'none'; img-src 'self' data: https:; object-src 'none'; script-src 'self' 'strict-dynamic'; style-src 'self' 'unsafe-inline';",
    );
  });
});
