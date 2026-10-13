import nonce from "#src/runtime/nitro/plugins/nonce";
import {
  createNitroApp,
  createPageEvent,
  createPageHtml,
  PAGE_ROUTE_RULES,
  PAGE_SRI_HASHES,
} from "#src/runtime/nitro/plugins/page.fixture";
import { createRouteRulesPlugin } from "#src/runtime/nitro/plugins/routeRules";
import { createSubresourceIntegrityPlugin } from "#src/runtime/nitro/plugins/subresourceIntegrity";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

// A rendered page's markup carrying its nonce and its integrity attributes: the nonce is generated for the request, then
// The nonce and SRI plugins rewrite each section of the page, a fresh page and event per iteration.
describe(nonce, () => {
  test("a rendered page's nonce and SRI attributes", async ({ bench }) => {
    const app = createNitroApp();
    createRouteRulesPlugin(PAGE_ROUTE_RULES)(app.nitroApp);
    await app.nitroApp.hooks.callHook("request", createPageEvent());
    nonce(app.nitroApp);
    createSubresourceIntegrityPlugin(PAGE_SRI_HASHES)(app.nitroApp);

    await bench.compare(
      bench("native — a page's markup copied", () => createPageHtml()),
      bench("a page's markup rewritten", () => {
        const event = createPageEvent();
        app.run("render:route", {}, { event });
        app.run("render:html", createPageHtml(), { event });
      }),
      { ...BENCHMARK_RUN_OPTIONS, iterations: 200, warmupIterations: 20 },
    );
  });
});
