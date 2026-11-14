import type { Context } from "#server/trpc/context";
import type { TRPCWebSocketConnection } from "trpc-nuxt-module/runtime/server/models/TRPCWebSocketConnection";

import { readSession } from "#server/services/auth/readSession";
import { webSocketPeerMap } from "#server/services/auth/webSocketPeerMap";
import { createCallerFactory } from "#server/trpc";
import { userRouter } from "#server/trpc/routers/user";
import { getResultAsync, noop } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { definePlugin } from "nitro";
import { WEBSOCKET_CLOSE_HOOK, WEBSOCKET_OPEN_HOOK } from "trpc-nuxt-module/runtime/constants";

const createCaller = createCallerFactory(userRouter);
// A socket that carries no session still opens and closes — it just has no device row to keep — so the user router's
// UNAUTHORIZED is the connection's ordinary life rather than a failure to report
const runAsConnection = async (
  { context }: TRPCWebSocketConnection<Context>,
  run: (caller: ReturnType<typeof createCaller>) => Promise<unknown>,
) => {
  await getResultAsync(() => run(createCaller(context))).match(noop, (error) => {
    if (error instanceof TRPCError && error.code === "UNAUTHORIZED") return;
    throw error;
  });
};

export default definePlugin((nitroApp) => {
  nitroApp.hooks.hook(WEBSOCKET_OPEN_HOOK, async (connection) => {
    // Kept under the session it opened as, so a revoke of that session can close the socket and its subscriptions
    const getSessionPayload = await readSession(connection.context.headers);
    if (getSessionPayload)
      webSocketPeerMap.set(connection.peer.id, { peer: connection.peer, sessionId: getSessionPayload.session.id });
    await runAsConnection(connection, (caller) => caller.connect());
  });
  nitroApp.hooks.hook(WEBSOCKET_CLOSE_HOOK, async (connection) => {
    webSocketPeerMap.delete(connection.peer.id);
    await runAsConnection(connection, (caller) => caller.disconnect());
  });
});
