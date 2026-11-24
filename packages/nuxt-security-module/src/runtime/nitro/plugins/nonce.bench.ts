import {
  createNoncedPageApp,
  createPageEvent,
  createPageHtml,
  PAGE_SRI_HASHES,
} from "#src/runtime/nitro/plugins/page.fixture";
import { createSubresourceIntegrityPlugin } from "#src/runtime/nitro/plugins/subresourceIntegrity";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

// A rendered page's markup carrying its nonce and its integrity attributes: the nonce is generated for the request.
// The nonce and SRI plugins rewrite each section of the page, with a fresh page and event per iteration.
describe("nonce plugin", () => {
  test("a rendered page's nonce and SRI attributes", async ({ bench }) => {
    const app = await createNoncedPageApp();
    await createSubresourceIntegrityPlugin(PAGE_SRI_HASHES)(app.nitroApp);

    let event = createPageEvent();
    // Each iteration gets its own event, built outside the timing.
    // The page's markup is built inside it on both sides.
    const beforeEach = () => {
      event = createPageEvent();
    };

    await bench.compare(
      bench("native — a page's markup copied", () => createPageHtml()),
      bench("a page's markup rewritten", { beforeEach }, () => {
        app.run("render:route", {}, { event });
        app.run("render:html", createPageHtml(), { event });
      }),
      { ...BENCHMARK_RUN_OPTIONS, iterations: 200, warmupIterations: 20 },
    );
  });
});
