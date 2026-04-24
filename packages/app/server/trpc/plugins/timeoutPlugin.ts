import type { AuthedContext } from "@@/server/models/auth/AuthedContext";

import { assertNotTimedOut } from "@@/server/services/message/moderation/assertNotTimedOut";
import { selectRoomSchema } from "@esposter/db-schema";
import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.context<AuthedContext>().create();

export const timeoutPlugin = t.procedure.use(async ({ ctx, getRawInput, next }) => {
  const rawInput = await getRawInput();
  const { roomId } = z.object({ roomId: selectRoomSchema.shape.id }).parse(rawInput);
  await assertNotTimedOut(ctx.db, ctx.getSessionPayload.user.id, roomId);
  return next();
});
