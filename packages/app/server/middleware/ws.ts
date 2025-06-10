import type { Server } from "node:http";

import { users } from "#shared/db/schema/users";
import { userStatuses } from "#shared/db/schema/userStatuses";
import { dayjs } from "#shared/services/dayjs";
import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import { auth } from "@@/server/auth";
import { useDb } from "@@/server/composables/useDb";
import { createContext } from "@@/server/trpc/context";
import { trpcRouter } from "@@/server/trpc/routers";
import { TRPCError } from "@trpc/server";
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
  const db = useDb();

  wss.on(
    "connection",
    getSynchronizedFunction(async (ws, { headers }) => {
      const session = await auth.api.getSession({
        headers: new Headers(Object.entries(headers as Record<string, string>)),
      });
      if (!session) throw new TRPCError({ code: "UNAUTHORIZED" });

      console.log(`Connection opened, client size: ${wss.clients.size}`);
      ws.once(
        "close",
        getSynchronizedFunction(async () => {
          const lastActiveAt = new Date();
          console.log(`Connection closed, client size: ${wss.clients.size}`);
          await db.insert(userStatuses).values({ lastActiveAt, userId: session.user.id }).onConflictDoUpdate({
            set: { lastActiveAt },
            target: users.id,
          });
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
