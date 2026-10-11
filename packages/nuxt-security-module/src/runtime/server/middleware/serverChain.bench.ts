import type { ModuleOptions } from "#src/models/ModuleOptions";
import type { Middleware } from "nitro/h3";

import allowedMethodsRestricter from "#src/runtime/server/middleware/allowedMethodsRestricter";
import corsHandler from "#src/runtime/server/middleware/corsHandler";
import csrf from "#src/runtime/server/middleware/csrf";
import rateLimiter from "#src/runtime/server/middleware/rateLimiter";
import requestSizeLimiter from "#src/runtime/server/middleware/requestSizeLimiter";
import { APP_SECURITY_OPTIONS, MINIMAL_SECURITY_OPTIONS } from "#src/runtime/server/middleware/serverChain.fixture";
import { setSecurityRouteMatcher } from "#src/runtime/services/securityRouteMatcher";
import { getDefaultModuleOptions } from "#src/services/getDefaultModuleOptions";
import { mergeModuleOptions } from "#src/services/mergeModuleOptions";
import { parseModuleOptions } from "#src/services/parseModuleOptions";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { H3Event } from "nitro/h3";
import { describe, test } from "vitest";

const DEV_SERVER_URL = "http://localhost:3000";
const REQUEST_URL = "http://localhost:3000/docs/section-1";

// The handlers module.ts registers for these options, in its order. Each sits behind the option that enables it, so a
// disabled feature adds nothing to the chain. Basic auth is left out: it is registered only with credentials, which
// neither configuration sets
const getServerChain = (options: ModuleOptions): Middleware[] => [
  ...(options.csrf ? [csrf] : []),
  ...(options.rateLimiter ? [rateLimiter] : []),
  ...(options.requestSizeLimiter ? [requestSizeLimiter] : []),
  ...(options.corsHandler ? [corsHandler] : []),
  ...(options.allowedMethodsRestricter ? [allowedMethodsRestricter] : []),
];

const runServerChain = async (chain: Middleware[]): Promise<void> => {
  const event = new H3Event(new Request(REQUEST_URL));
  for (const middleware of chain) await middleware(event, () => undefined);
};

// The module's options for a consumer's overrides, with the route table the module resolves at startup, and the chain
// those options register
const setUpServerChain = (overrides: Partial<ModuleOptions>): Middleware[] => {
  const options = parseModuleOptions(
    mergeModuleOptions(getDefaultModuleOptions(false, DEV_SERVER_URL, false), overrides),
  );
  setSecurityRouteMatcher({ "/**": options });
  return getServerChain(options);
};

// One request through each configuration's chain. The native task is the event alone, so the cost of the handlers
// reads above it
describe("server middleware chain", () => {
  test("the app's options", async ({ bench }) => {
    const chain = setUpServerChain(APP_SECURITY_OPTIONS);

    await bench.compare(
      bench("native — creating the event alone", () => new H3Event(new Request(REQUEST_URL))),
      bench("a request through the app's chain", () => runServerChain(chain)),
      { ...BENCHMARK_RUN_OPTIONS, iterations: 2000, warmupIterations: 200 },
    );
  });

  test("most features off", async ({ bench }) => {
    const chain = setUpServerChain(MINIMAL_SECURITY_OPTIONS);

    await bench.compare(
      bench("native — creating the event alone", () => new H3Event(new Request(REQUEST_URL))),
      bench("a request through a chain with most features off", () => runServerChain(chain)),
      { ...BENCHMARK_RUN_OPTIONS, iterations: 2000, warmupIterations: 200 },
    );
  });
});
