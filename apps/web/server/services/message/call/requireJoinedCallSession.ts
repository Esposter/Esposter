import type { Context } from "#server/trpc/context";
import type { GetSessionPayload } from "#shared/models/auth/GetSessionPayload";

import { getCallObject } from "#server/services/message/call/getCallObject";
import { requireReadableCallSession } from "#server/services/message/call/requireReadableCallSession";
import { getForbiddenError } from "#server/trpc/guards/getForbiddenError";

export const requireJoinedCallSession = async (
  db: Context["db"],
  sessionPayload: GetSessionPayload,
  callSessionId: string,
) => {
  const callSession = await requireReadableCallSession(db, sessionPayload, callSessionId);
  if (callSession.userId === sessionPayload.user.id) return callSession;

  const { isJoined } = await getCallObject(callSessionId).readAccess({ sessionId: sessionPayload.session.id });
  if (isJoined) return callSession;
  throw getForbiddenError("Must be in call");
};
