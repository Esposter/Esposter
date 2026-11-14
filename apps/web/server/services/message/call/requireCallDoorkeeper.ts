import type { Context } from "#server/trpc/context";
import type { GetSessionPayload } from "#shared/models/auth/GetSessionPayload";

import { getCallObject } from "#server/services/message/call/getCallObject";
import { requireCallSession } from "#server/services/message/call/requireCallSession";
import { getForbiddenError } from "#server/trpc/guards/getForbiddenError";

// Only the creator, and only while they are themselves in the call, decides who gets in — for admitting and
// Dismissing alike
export const requireCallDoorkeeper = async (
  db: Context["db"],
  sessionPayload: GetSessionPayload,
  callSessionId: string,
  action: string,
) => {
  const { session: callerSession, user: callerUser } = sessionPayload;
  const { isJoined } = await getCallObject(callSessionId).readAccess({ sessionId: callerSession.id });
  if (!isJoined) throw getForbiddenError(`Must be in call to ${action} knockers`);

  const callSession = await requireCallSession(db, callSessionId);
  if (callSession.userId !== callerUser.id) throw getForbiddenError(`Must be call creator to ${action} knockers`);
  return callSession;
};
