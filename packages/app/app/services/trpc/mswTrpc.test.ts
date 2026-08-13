import type { TRPCRouter } from "@@/server/trpc/routers";

import { transformer } from "#shared/services/trpc/transformer";
import { TRPC_CLIENT_PATH } from "@/services/trpc/constants";
import { createTRPCMsw, httpLink } from "msw-trpc";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe } from "vitest";

// Client-side tRPC calls are answered at the network, not by replacing the client: the real plugin, its links
// And its transformer all run, so a test exercises the same path production does. Handlers are typed off
// `TRPCRouter`, which is what a hand-written client stub cannot give — a renamed or re-shaped procedure fails
// To compile here instead of silently answering a call that no longer exists.
export const trpcMsw = createTRPCMsw<TRPCRouter>({
  links: [httpLink({ url: TRPC_CLIENT_PATH })],
  transformer: { input: transformer, output: transformer },
});

const server = setupServer();

// Call at `describe` scope in any file that drives a procedure, then declare per-test handlers with
// `server.use(trpcMsw.<procedure>.<query|mutation>(...))`. Handlers reset between tests, and an unhandled
// Request passes through rather than failing — a test declares only the calls it is about.
export const setupMswTrpc = () => {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: "bypass" });
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });
  return server;
};

describe.todo("mswTrpc");
