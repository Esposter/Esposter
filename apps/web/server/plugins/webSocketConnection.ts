import type { Context } from "#server/trpc/context";
import type { TRPCWebSocketConnection } from "trpc-nuxt-module/runtime/server/models/TRPCWebSocketConnection";

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
  nitroApp.hooks.hook(WEBSOCKET_OPEN_HOOK, (connection) => runAsConnection(connection, (caller) => caller.connect()));
  nitroApp.hooks.hook(WEBSOCKET_CLOSE_HOOK, (connection) =>
    runAsConnection(connection, (caller) => caller.disconnect()),
  );
});
