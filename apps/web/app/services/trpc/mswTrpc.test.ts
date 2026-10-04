import type { TRPCRouter } from "#server/trpc/routers";

import { rootConfig } from "#server/trpc/rootConfig";
import { TRPC_CLIENT_PATH, TRPC_WS_PATH } from "@/services/trpc/constants";
import { initTRPC } from "@trpc/server";
import { Headers as HappyDomHeaders } from "happy-dom";
import { setupServer } from "msw/node";
import { createTRPCMsw } from "trpc-msw";
import { afterAll, afterEach, beforeAll, describe, vi } from "vitest";

// Client-side tRPC calls are answered at the network, not by replacing the client: the real plugin, its links and
// Its transformer all run, and the mock router answers with the real server's transformer and error formatter.
// Call at `describe` scope, then register per-test resolvers with `trpcMsw.<procedure>.<query|mutation|subscription>`.
// Resolvers are forgotten between tests, and a request that is not tRPC's passes through rather than failing
export const setupMswTrpc = () => {
  const { handlers, reset, trpc } = createTRPCMsw<TRPCRouter>({
    endpoint: `${window.location.origin}${TRPC_CLIENT_PATH}`,
    t: initTRPC.create(rootConfig),
    webSocketUrl: `ws://${window.location.host}${TRPC_WS_PATH}`,
  });
  const server = setupServer(...handlers);
  const nuxtFetch = globalThis.fetch;

  beforeAll(() => {
    // @TODO: no upstream issue — the Nuxt test environment swaps in happy-dom's `fetch` and `Request` but leaves
    // Node's `Headers`, and msw crosses that seam both ways: it sends a happy-dom `Request` through a `fetch` that
    // Hands it to undici as is, and builds the intercepted request from a Node `Headers` that happy-dom's `Request`
    // Reads as empty. Both are aligned here, before msw patches `fetch`
    vi.stubGlobal("fetch", async (input: RequestInfo | URL, init?: RequestInit) =>
      input instanceof Request
        ? nuxtFetch(input.url, {
            body: input.body ? await input.arrayBuffer() : undefined,
            headers: [...input.headers],
            method: input.method,
          })
        : nuxtFetch(input, init),
    );
    vi.stubGlobal("Headers", HappyDomHeaders);
    server.listen({ onUnhandledFrame: "bypass" });
  });

  afterEach(() => {
    reset();
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
    vi.unstubAllGlobals();
  });
  return { server, trpcMsw: trpc };
};

describe.todo(setupMswTrpc);
