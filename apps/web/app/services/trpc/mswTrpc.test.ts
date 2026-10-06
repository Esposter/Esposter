import type { TRPCRouter } from "#server/trpc/routers";

import { rootConfig } from "#server/trpc/rootConfig";
import { trpcRouter } from "#server/trpc/routers";
import { TRPC_CLIENT_PATH, TRPC_WS_PATH } from "@/services/trpc/constants";
import { initTRPC } from "@trpc/server";
import { Headers as HappyDomHeaders } from "happy-dom";
import { setupServer } from "msw/node";
import { createTRPCMsw } from "trpc-msw";
import { afterAll, afterEach, beforeAll, describe, expect, vi } from "vitest";

// Client-side tRPC calls are answered at the network, not by replacing the client: the real plugin, its links and
// Its transformer all run, and the mock router answers with the real server's transformer and error formatter.
// Call at `describe` scope, then register per-test resolvers with `trpcMsw.<procedure>.<query|mutation|subscription>`.
// Resolvers are forgotten between tests, and a request that is not tRPC's passes through rather than failing
export const setupMswTrpc = () => {
  const { handlers, reset, trpc } = createTRPCMsw<TRPCRouter>({
    endpoint: `${window.location.origin}${TRPC_CLIENT_PATH}`,
    // Every mocked call passes the real procedure's input parsers, so a test sending what the server rejects fails
    router: trpcRouter,
    t: initTRPC.create(rootConfig),
    webSocketUrl: `ws://${window.location.host}${TRPC_WS_PATH}`,
  });
  const server = setupServer(...handlers);
  const nuxtFetch = globalThis.fetch;
  // Each request msw has yet to answer, settled when it has
  const pendingRequestIdEndMap = new Map<string, PromiseWithResolvers<void>>();
  server.events.on("request:start", ({ requestId }) => {
    pendingRequestIdEndMap.set(requestId, Promise.withResolvers<void>());
  });
  server.events.on("request:end", ({ requestId }) => {
    pendingRequestIdEndMap.get(requestId)?.resolve();
    pendingRequestIdEndMap.delete(requestId);
  });

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

  // A request sent after the test ended comes from a handler the test never awaited, and left alone it lands after msw
  // Closes, where what it logs races the worker's teardown into an error pinned on whichever file was running. A request
  // Already out when the test ended — one it held and released — is answered here while msw still listens, and one
  // Timer boundary after that lets a batch the last answer scheduled dispatch before the check
  afterEach(async () => {
    const lateRequestUrls: string[] = [];
    const onRequestStart = ({ request }: { request: Request }) => {
      lateRequestUrls.push(request.url);
    };
    server.events.on("request:start", onRequestStart);
    await Promise.all(pendingRequestIdEndMap.values().map(({ promise }) => promise));
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
    server.events.removeListener("request:start", onRequestStart);
    reset();
    server.resetHandlers();
    expect(lateRequestUrls, "requests sent after the test ended").toStrictEqual([]);
  });

  afterAll(() => {
    server.close();
    vi.unstubAllGlobals();
  });
  return { server, trpcMsw: trpc };
};

describe.todo(setupMswTrpc);
