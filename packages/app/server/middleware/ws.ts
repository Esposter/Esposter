import type { Server } from "node:http";

import { dayjs } from "#shared/services/dayjs";
import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import { createCallerFactory } from "@@/server/trpc";
import { createContext } from "@@/server/trpc/context";
import { trpcRouter } from "@@/server/trpc/routers";
import { roomRouter } from "@@/server/trpc/routers/room";
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
    keepAlive: {
      enabled: true,
      pingMs: dayjs.duration(30, "seconds").asMilliseconds(),
      pongWaitMs: dayjs.duration(5, "seconds").asMilliseconds(),
    },
    router: trpcRouter,
    wss,
  });
  const createCaller = createCallerFactory(roomRouter);

  wss.on("connection", (ws, req) => {
    const context = createContext(Object.assign(event, { req }));
    const caller = createCaller(context);
    console.log(`Connection opened, client size: ${wss.clients.size}`);
    ws.once(
      "close",
      getSynchronizedFunction(async () => {
        console.log(`Connection closed, client size: ${wss.clients.size}`);
        await caller.updateStatus();
      }),
    );
  });
  process.on("SIGTERM", () => {
    handler.broadcastReconnectNotification();
    wss.close();
  });

  console.log("WebSocket Server is listening");
  global.websocketServer = wss;
});
