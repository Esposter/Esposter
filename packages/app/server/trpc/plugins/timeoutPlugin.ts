import type { AuthedContext } from "@@/server/models/auth/AuthedContext";

import { assertNotTimedOut } from "@@/server/services/moderation/assertNotTimedOut";
import { selectRoomSchema } from "@esposter/db-schema";
import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.context<AuthedContext>().create();

export const timeoutPlugin = t.procedure.use(async ({ ctx, getRawInput, next }) => {
  const rawInput = await getRawInput();
  const parsedInput = z.object({ roomId: selectRoomSchema.shape.id }).safeParse(rawInput);
  if (parsedInput.success) await assertNotTimedOut(ctx.db, ctx.getSessionPayload.user.id, parsedInput.data.roomId);
  return next();
});
