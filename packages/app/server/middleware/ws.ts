import type { CreateWSSContextFnOptions } from "@trpc/server/adapters/ws";
import type { Server } from "node:http";

import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import { createCallerFactory } from "@@/server/trpc";
import { createContext } from "@@/server/trpc/context";
import { trpcRouter } from "@@/server/trpc/routers";
import { userRouter } from "@@/server/trpc/routers/user";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import { WebSocketServer } from "ws";

export default defineEventHandler((event) => {
  if (global.websocketServer) return;

  const server =
    event.node.res.socket && "server" in event.node.res.socket ? (event.node.res.socket.server as Server) : null;
  if (!server) return;

  const wss = new WebSocketServer({ server });
  const handler = applyWSSHandler({
    createContext,
    keepAlive: { enabled: true },
    router: trpcRouter,
    wss,
  });
  const createCaller = createCallerFactory(userRouter);

  wss.on(
    "connection",
    getSynchronizedFunction(async (ws, req) => {
      const context = createContext({ req, res: ws } as CreateWSSContextFnOptions);
      const caller = createCaller(context);
      await caller.connect();
      console.log(`Connection opened, client size: ${wss.clients.size}`);
      ws.once(
        "close",
        getSynchronizedFunction(async () => {
          console.log(`Connection closed, client size: ${wss.clients.size}`);
          await caller.disconnect();
        }),
      );
    }),
  );
  process.on("SIGTERM", () => {
    handler.broadcastReconnectNotification();
    wss.close();
  });

  console.log("WebSocket Server is listening");
  global.websocketServer = wss;
});
