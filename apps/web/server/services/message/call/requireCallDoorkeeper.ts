import type { AuthedContext } from "#server/models/auth/AuthedContext";

import { useCallObject } from "#server/composables/realtime/useCallObject";
import { requireCallSession } from "#server/services/message/call/requireCallSession";
import { getForbiddenError } from "#server/trpc/guards/getForbiddenError";

// Only the creator, and only while they are themselves in the call, decides who gets in — for admitting and
// Dismissing alike
export const requireCallDoorkeeper = async (
  { db, session: callerSession, user: callerUser }: Pick<AuthedContext, "db" | "session" | "user">,
  callSessionId: string,
  action: string,
) => {
  const { isJoined } = await useCallObject(callSessionId).readAccess({ sessionId: callerSession.id });
  if (!isJoined) throw getForbiddenError(`Must be in call to ${action} knockers`);

  const callSession = await requireCallSession(db, callSessionId);
  if (callSession.userId !== callerUser.id) throw getForbiddenError(`Must be call creator to ${action} knockers`);
  return callSession;
};
