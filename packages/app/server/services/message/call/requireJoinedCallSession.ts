import type { GetSessionPayload } from "#shared/models/auth/GetSessionPayload";
import type { Context } from "@@/server/trpc/context";

import { callSessionParticipantMap } from "@@/server/services/message/call/callParticipantMap";
import { requireReadableCallSession } from "@@/server/services/message/call/requireReadableCallSession";
import { getForbiddenError } from "@@/server/trpc/guards/getForbiddenError";

export const requireJoinedCallSession = async (
  db: Context["db"],
  sessionPayload: GetSessionPayload,
  callSessionId: string,
) => {
  const callSession = await requireReadableCallSession(db, sessionPayload, callSessionId);
  if (
    callSession.userId === sessionPayload.user.id ||
    callSessionParticipantMap.get(callSessionId)?.has(sessionPayload.session.id)
  )
    return callSession;

  throw getForbiddenError("Must be in call");
};
