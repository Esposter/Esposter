import { createContext } from "@/server/trpc/context";
import { appRouter } from "@/server/trpc/routers";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import chalk from "chalk";
import type { Server as HTTPServer } from "http";
import type { Server, WebSocket } from "ws";
import { WebSocketServer } from "ws";

declare global {
  // eslint-disable-next-line no-var
  var websocketServer: Server<WebSocket> | undefined;
}

export default defineEventHandler((event) => {
  if (global.websocketServer) return;

  const server =
    event.node.res.socket && "server" in event.node.res.socket ? (event.node.res.socket.server as HTTPServer) : null;
  if (!server) return;

  const wss = new WebSocketServer({ server });
  const handler = applyWSSHandler({ wss, router: appRouter, createContext });

  wss.on("connection", (ws) => {
    console.log(`Connection opened, client size: ${wss.clients.size}`);
    ws.once("close", () => console.log(`Connection closed, client size: ${wss.clients.size}`));
  });
  process.on("SIGTERM", () => {
    handler.broadcastReconnectNotification();
    wss.close();
  });

  console.log(chalk.yellow("WebSocket Server is listening"));
  global.websocketServer = wss;
});
