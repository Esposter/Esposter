import type { Server } from "node:http";

import { dayjs } from "#shared/services/dayjs";
import { createContext } from "@@/server/trpc/context";
import { trpcRouter } from "@@/server/trpc/routers";
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

  wss.on("connection", (ws) => {
    console.log(`Connection opened, client size: ${wss.clients.size}`);
    ws.once("close", () => {
      console.log(`Connection closed, client size: ${wss.clients.size}`);
    });
  });
  process.on("SIGTERM", () => {
    handler.broadcastReconnectNotification();
    wss.close();
  });

  console.log("WebSocket Server is listening");
  global.websocketServer = wss;
});
