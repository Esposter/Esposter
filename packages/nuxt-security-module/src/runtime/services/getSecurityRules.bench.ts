import { createPageEvent, PAGE_PATHNAME, PAGE_ROUTE_RULES } from "#src/runtime/nitro/plugins/page.fixture";
import { getSecurityRules } from "#src/runtime/services/getSecurityRules";
import { findSecurityRules, setSecurityRouteMatcher } from "#src/runtime/services/securityRouteMatcher";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

// A request's route rules, resolved for each request's own event against the table resolved once at startup.
// The native baseline is the router's match alone, so the cost of the merge and the per-event cache shows beside it.
describe(getSecurityRules, () => {
  test("a request's route rules", async ({ bench }) => {
    setSecurityRouteMatcher(PAGE_ROUTE_RULES);
    let event = createPageEvent();
    // Each iteration gets its own event, built outside the timing, so the per-event cache misses as it does for a
    // Request
    const beforeEach = () => {
      event = createPageEvent();
    };

    await bench.compare(
      bench("native — matching the path alone", () => findSecurityRules(PAGE_PATHNAME)),
      bench("rules of a request's path", { beforeEach }, () => getSecurityRules(event)),
      { ...BENCHMARK_RUN_OPTIONS, iterations: 2000, warmupIterations: 200 },
    );
  });
});
