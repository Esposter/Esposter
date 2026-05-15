import type { GetSessionPayload } from "#shared/models/auth/GetSessionPayload";
import type { Context } from "@@/server/trpc/context";

import { callSessionParticipantMap } from "@@/server/services/message/call/callParticipantMap";
import { requireReadableCallSession } from "@@/server/services/message/call/requireReadableCallSession";
import { ForbiddenError } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

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

  throw new TRPCError({
    code: "FORBIDDEN",
    message: new ForbiddenError("Must be in call").message,
  });
};
