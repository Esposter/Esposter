import { createContext } from "@/server/trpc/context";
import { appRouter } from "@/server/trpc/routers";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import https from "https";
import type { Server, WebSocket } from "ws";
import { WebSocketServer } from "ws";

declare global {
  // eslint-disable-next-line no-var
  var websocketServer: Server<WebSocket> | undefined;
}

export default defineEventHandler(() => {
  if (global.websocketServer) return;

  const baseUrl = process.env.WS_BASE_URL;
  const port = parseInt(process.env.WS_PORT);
  const server = https.createServer();
  const wss = new WebSocketServer({ server });
  const handler = applyWSSHandler({ wss, router: appRouter, createContext });

  wss.on("connection", (ws) => {
    console.log(`Connection opened (${wss.clients.size})`);
    ws.once("close", () => console.log(`Connection closed (${wss.clients.size})`));
  });
  process.on("SIGTERM", () => {
    handler.broadcastReconnectNotification();
    wss.close();
  });

  server.listen(port);
  console.log(`WebSocket Server is listening on ${baseUrl}:${port}`);
  global.websocketServer = wss;
});
