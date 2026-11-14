import type { AuthedContext } from "#server/models/auth/AuthedContext";

import { requireCallSession } from "#server/services/message/call/requireCallSession";
import { assertIsMember } from "#server/services/room/assertIsMember";

export const requireReadableCallSession = async (ctx: Pick<AuthedContext, "db" | "user">, callSessionId: string) => {
  const callSession = await requireCallSession(ctx.db, callSessionId);
  if (callSession.roomId) await assertIsMember(ctx, callSession.roomId);
  return callSession;
};
