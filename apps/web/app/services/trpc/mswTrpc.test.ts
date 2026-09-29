import type { TRPCRouter } from "@@/server/trpc/routers";

import { TRPC_CLIENT_PATH, TRPC_WS_PATH } from "@/services/trpc/constants";
import { rootConfig } from "@@/server/trpc/rootConfig";
import { initTRPC } from "@trpc/server";
import { setupServer } from "msw/node";
import { createTRPCMsw } from "trpc-msw";
import { afterAll, afterEach, beforeAll, describe } from "vitest";

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

  beforeAll(() => {
    server.listen({ onUnhandledRequest: "bypass" });
  });

  afterEach(() => {
    reset();
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });
  return { server, trpcMsw: trpc };
};

describe.todo(setupMswTrpc);
