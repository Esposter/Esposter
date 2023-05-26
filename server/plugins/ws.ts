import { createContext } from "@/server/trpc/context";
import { appRouter } from "@/server/trpc/routers";
import { WS_PORT } from "@/services/trpc/constants";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import chalk from "chalk";
import { WebSocketServer } from "ws";

export default defineNitroPlugin((nitro) => {
  const wss = new WebSocketServer({ port: WS_PORT });
  const handler = applyWSSHandler({ wss, router: appRouter, createContext });

  wss.on("connection", (ws) => {
    console.log(`Connection opened, client size: ${wss.clients.size}`);
    ws.once("close", () => console.log(`Connection closed, client size: ${wss.clients.size}`));
  });

  console.log(chalk.yellow(`WebSocket Server is listening on port:${WS_PORT}`));

  nitro.hooks.hookOnce("close", () => {
    handler.broadcastReconnectNotification();
    wss.close();
  });
});
