import { DEFAULT_ENDPOINT } from "#src/runtime/constants";
import { createTRPCEventHandler } from "#src/runtime/server/createTRPCEventHandler";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { initTRPC } from "@trpc/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { H3 } from "nitro/h3";
import { describe, test } from "vitest";

const t = initTRPC.create();
const router = t.router({ write: t.procedure.mutation(() => 0) });
const path = `${DEFAULT_ENDPOINT}/write`;
const body = "{}";
const headers = { "content-type": "application/json" };
// H3's own fetch, the in-process shape Nitro answers a server-rendered request fetch with
const app = new H3().all(`${DEFAULT_ENDPOINT}/**`, createTRPCEventHandler({ router }));
// The handler is the request hot path, so what it costs is measured against tRPC's own fetch adapter answering the
// Same request with no h3 event in front of it, which is h3's routing and event alone, since the handler hands tRPC
// The request h3 holds. A request's body is read once, so each iteration builds its own
describe(createTRPCEventHandler, () => {
  test("a mutation", async ({ bench }) => {
    await bench.compare(
      bench("native — tRPC's fetch adapter", () =>
        fetchRequestHandler({
          endpoint: DEFAULT_ENDPOINT,
          req: new Request(`http://localhost${path}`, { body, headers, method: "POST" }),
          router,
        })),
      bench("createTRPCEventHandler — through an h3 event", () =>
        app.fetch(new Request(`http://localhost${path}`, { body, headers, method: "POST" }))),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});
