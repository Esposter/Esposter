import type { TRPCRouter } from "#server/trpc/routers/index";

import { rootConfig } from "#server/trpc/rootConfig";
import { trpcRouter } from "#server/trpc/routers/index";
import { TRPC_CLIENT_PATH } from "#src/services/trpc/constants";
import { initTRPC } from "@trpc/server";
import { setupServer } from "msw/node";
import { createTRPCMsw } from "trpc-msw";
import { afterAll, afterEach, beforeAll, describe, expect, vi } from "vitest";

// What every mocked call is answered with. The headers a resolver appends to it are sent back on the call's response
interface MswContext {
  responseHeaders: Headers;
}

// Client-side tRPC calls are answered at the network, not by replacing the client: the real plugin, its links and
// Its transformer all run, and the mock router answers with the real server's transformer and error formatter.
// Call at `describe` scope, then register per-test resolvers with `trpcMsw.<procedure>.<query|mutation|subscription>`.
// Resolvers are forgotten between tests. A request no handler answers is an error naming its method and url, and a
// Procedure the test registered no resolver for fails the test by its path once it ends.
// It never reaches a real socket. A request a resolver holds fails the test that held it, not the hooks after it
export const setupMswTrpc = () => {
  // Each procedure called with no resolver to answer it, which tRPC answers with NOT_FOUND. The code under test reads
  // That as a failed call and carries on, so the test would pass on a path it never meant to take
  const unansweredPaths = new Set<string>();
  const { handlers, reset, trpc } = createTRPCMsw<TRPCRouter, MswContext>({
    createContext: () => ({ responseHeaders: new Headers() }),
    endpoint: `${window.location.origin}${TRPC_CLIENT_PATH}`,
    onUnhandledProcedureCall: (path) => {
      unansweredPaths.add(path);
    },
    responseMeta: ({ ctx }) => ({ headers: ctx?.responseHeaders ?? new Headers() }),
    // Every mocked call passes the real procedure's input parsers, so a test sending what the server rejects fails
    router: trpcRouter,
    t: initTRPC.context<MswContext>().create(rootConfig),
  });
  const server = setupServer(...handlers);
  const nuxtFetch = globalThis.fetch;
  // Each request msw has yet to answer, with its method and url, and settled when msw has answered it
  const pendingRequestMap = new Map<string, { settled: PromiseWithResolvers<void>; url: string }>();
  server.events.on("request:start", ({ request, requestId }) => {
    pendingRequestMap.set(requestId, {
      settled: Promise.withResolvers<void>(),
      url: `${request.method} ${request.url}`,
    });
  });
  server.events.on("request:end", ({ requestId }) => {
    pendingRequestMap.get(requestId)?.settled.resolve();
    pendingRequestMap.delete(requestId);
  });

  beforeAll(() => {
    // @TODO: https://github.com/nuxt/test-utils/issues/1891 — the Nuxt test environment's `fetch` hands a happy-dom
    // `Request` to Node's `fetch` as is, which reads it as `[object Request]`, and msw 3 sends every request as one.
    // Its parts are sent instead, before msw patches `fetch`
    vi.stubGlobal("fetch", async (input: RequestInfo | URL, init?: RequestInit) =>
      input instanceof Request
        ? nuxtFetch(input.url, {
            ...(input.body ? { body: await input.arrayBuffer() } : {}),
            headers: [...input.headers],
            method: input.method,
          })
        : nuxtFetch(input, init),
    );
    server.listen({ onUnhandledFrame: "error" });
  });

  // A request sent after the test ended comes from a handler the test never awaited, and left alone it lands after msw
  // Closes, where what it logs races the worker's teardown into an error pinned on whichever file was running. A
  // Request already out when the test ended — one it held and released — is answered here while msw still listens.
  // Waiting for it is bounded by one timer boundary: a request still open after it is held by a resolver the test never
  // Released, so it fails this test by name and is dropped, rather than the hook waiting on a response that will never
  // Come
  afterEach(async () => {
    const lateRequestUrls: string[] = [];
    const onRequestStart = ({ request }: { request: Request }) => {
      lateRequestUrls.push(request.url);
    };
    server.events.on("request:start", onRequestStart);
    await Promise.race([
      Promise.all(Array.from(pendingRequestMap.values(), ({ settled }) => settled.promise)),
      new Promise((resolve) => {
        setTimeout(resolve, 0);
      }),
    ]);
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
    const heldRequestUrls = Array.from(pendingRequestMap.values(), ({ url }) => url);
    pendingRequestMap.clear();
    const unansweredProcedurePaths = [...unansweredPaths];
    unansweredPaths.clear();
    server.events.removeListener("request:start", onRequestStart);
    reset();
    server.resetHandlers();
    expect(lateRequestUrls, "requests sent after the test ended").toStrictEqual([]);
    expect(heldRequestUrls, "requests the test left unanswered").toStrictEqual([]);
    expect(unansweredProcedurePaths, "procedures the test registered no resolver for").toStrictEqual([]);
  });

  afterAll(() => {
    server.close();
    vi.unstubAllGlobals();
  });
  return { server, trpcMsw: trpc };
};

describe.todo(setupMswTrpc);
