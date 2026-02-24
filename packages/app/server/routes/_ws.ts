import type { CreateWSSContextFnOptions } from "@trpc/server/adapters/ws";
import type { Peer } from "crossws";
import type { IncomingMessage } from "node:http";

import { WsAdapter } from "@@/server/models/ws/WsAdapter";
import { WssAdapter } from "@@/server/models/ws/WssAdapter";
import { createCallerFactory } from "@@/server/trpc";
import { createContext } from "@@/server/trpc/context";
import { trpcRouter } from "@@/server/trpc/routers";
import { userRouter } from "@@/server/trpc/routers/user";
import { TRPCError } from "@trpc/server";
import { applyWSSHandler } from "@trpc/server/adapters/ws";

const wss = new WssAdapter();
const handler = applyWSSHandler({
  createContext: (opts) => createContext(opts),
  keepAlive: { enabled: true },
  router: trpcRouter,
  wss,
});
const createCaller = createCallerFactory(userRouter);

process.on("SIGTERM", () => {
  handler.broadcastReconnectNotification();
  wss.close();
});

const getReq = (peer: Peer): IncomingMessage =>
  (peer.context.node as undefined | { req: IncomingMessage })?.req ??
  ({ headers: Object.fromEntries(peer.request.headers.entries()) } as unknown as IncomingMessage);

export default defineWebSocketHandler({
  close: async (peer, event) => {
    if (!peer.wsAdapter) return;
    peer.wsAdapter.readyState = peer.wsAdapter.CLOSED;
    peer.wsAdapter.emit("close", event.code, event.reason);
    const req = getReq(peer);
    const caller = createCaller(createContext({ req, res: peer.wsAdapter } as CreateWSSContextFnOptions));
    try {
      await caller.disconnect();
      console.log(`WS connection closed, clients: ${wss.clients.size}`);
    } catch (error) {
      if (error instanceof TRPCError && error.code !== "UNAUTHORIZED") throw error;
    }
  },

  error(peer, error) {
    peer.wsAdapter?.emit("error", error);
  },

  message(peer, message) {
    peer.wsAdapter?.emit("message", Buffer.from(message.text()), false);
  },

  open: async (peer) => {
    const req = getReq(peer);
    peer.wsAdapter = new WsAdapter(peer);
    wss.addConnection(peer.wsAdapter, req);
    const caller = createCaller(createContext({ req, res: peer.wsAdapter } as CreateWSSContextFnOptions));
    try {
      await caller.connect();
      console.log(`WS connection opened, clients: ${wss.clients.size}`);
    } catch (error) {
      if (error instanceof TRPCError && error.code !== "UNAUTHORIZED") throw error;
    }
  },
});
