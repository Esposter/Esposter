import type { Context } from "#server/trpc/context";
import type { GetSessionPayload } from "#shared/models/auth/GetSessionPayload";

import { getCallObject } from "#server/services/message/call/getCallObject";
import { requireCallSession } from "#server/services/message/call/requireCallSession";
import { getForbiddenError } from "#server/trpc/guards/getForbiddenError";

export const requireKnockerCallSession = async (
  db: Context["db"],
  sessionPayload: GetSessionPayload,
  callSessionId: string,
) => {
  const callSession = await requireCallSession(db, callSessionId);
  const { isKnocking } = await getCallObject(callSessionId).readAccess({ sessionId: sessionPayload.session.id });
  if (isKnocking) return callSession;
  throw getForbiddenError("Must be waiting to join call");
};
