import type { CreateWSSContextFnOptions } from "@trpc/server/adapters/ws";
import type { Peer } from "crossws";
import type { IncomingMessage } from "node:http";

import { WsAdapter } from "@@/server/models/ws/WsAdapter";
import { WssAdapter } from "@@/server/models/ws/WssAdapter";
import { createCallerFactory } from "@@/server/trpc";
import { createContext } from "@@/server/trpc/context";
import { trpcRouter } from "@@/server/trpc/routers";
import { userRouter } from "@@/server/trpc/routers/user";
import { getResultAsync } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { applyWSSHandler } from "@trpc/server/adapters/ws";

const wss = new WssAdapter();
const handler = applyWSSHandler({
  createContext: (options) => createContext(options),
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
  ({ headers: Object.fromEntries(peer.request.headers.entries()) } as IncomingMessage);

// A socket that carries no session still opens and closes — it just has no device row to keep — so the user
// Router's UNAUTHORIZED is the connection's ordinary life rather than a failure to report
const runAsPeer = async (
  peer: Peer,
  req: IncomingMessage,
  run: (caller: ReturnType<typeof createCaller>) => Promise<unknown>,
  message: string,
) => {
  const caller = createCaller(createContext({ req, res: peer.wsAdapter } as CreateWSSContextFnOptions));
  await getResultAsync(() => run(caller)).match(
    () => {
      console.log(`${message}, clients: ${wss.clients.size}`);
    },
    (error) => {
      if (error instanceof TRPCError && error.code !== "UNAUTHORIZED") throw error;
    },
  );
};

export default defineWebSocketHandler({
  close: async (peer, event) => {
    if (!peer.wsAdapter) return;
    peer.wsAdapter.readyState = peer.wsAdapter.CLOSED;
    peer.wsAdapter.emit("close", event.code, event.reason);
    await runAsPeer(peer, getReq(peer), (caller) => caller.disconnect(), "WS connection closed");
  },

  error: (peer, error) => {
    peer.wsAdapter?.emit("error", error);
  },

  message: (peer, message) => {
    peer.wsAdapter?.emit("message", Buffer.from(message.text()), false);
  },

  open: async (peer) => {
    const req = getReq(peer);
    peer.wsAdapter = new WsAdapter(peer);
    wss.addConnection(peer.wsAdapter, req);
    await runAsPeer(peer, req, (caller) => caller.connect(), "WS connection opened");
  },
});
