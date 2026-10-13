import nonce from "#src/runtime/nitro/plugins/nonce";
import {
  createNitroApp,
  createPageEvent,
  PAGE_HEADERS,
  PAGE_ROUTE_RULES,
} from "#src/runtime/nitro/plugins/page.fixture";
import { createRouteRulesPlugin } from "#src/runtime/nitro/plugins/routeRules";
import securityHeaders from "#src/runtime/nitro/plugins/securityHeaders";
import { serializeSecurityHeaders } from "#src/runtime/services/serializeSecurityHeaders";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

// A page's response from the nonce it is generated for through the headers that carry it, one fresh request event each
// Iteration so no rules or state are cached from an earlier request. The native baseline is the serialization alone.
describe(securityHeaders, () => {
  test("a page's response", async ({ bench }) => {
    const app = createNitroApp();
    createRouteRulesPlugin(PAGE_ROUTE_RULES)(app.nitroApp);
    await app.nitroApp.hooks.callHook("request", createPageEvent());
    nonce(app.nitroApp);
    securityHeaders(app.nitroApp);

    await bench.compare(
      bench("native — serializing the page's headers", () => serializeSecurityHeaders(PAGE_HEADERS)),
      bench("headers applied to a response", () => app.run("render:route", {}, { event: createPageEvent() })),
      { ...BENCHMARK_RUN_OPTIONS, iterations: 500, warmupIterations: 50 },
    );
  });
});
