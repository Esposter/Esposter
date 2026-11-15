import type { AuthedContext } from "#server/models/auth/AuthedContext";

import { useCallObject } from "#server/composables/realtime/useCallObject";
import { requireReadableCallSession } from "#server/services/message/call/requireReadableCallSession";
import { getForbiddenError } from "#server/trpc/guards/getForbiddenError";

export const requireJoinedCallSession = async (
  ctx: Pick<AuthedContext, "db" | "session" | "user">,
  callSessionId: string,
) => {
  const callSession = await requireReadableCallSession(ctx, callSessionId);
  if (callSession.userId === ctx.user.id) return callSession;

  const { isJoined } = await useCallObject(callSessionId).readAccess({ sessionId: ctx.session.id });
  if (isJoined) return callSession;
  throw getForbiddenError("Must be in call");
};
