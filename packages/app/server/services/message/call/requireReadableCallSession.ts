import type { GetSessionPayload } from "#shared/models/auth/GetSessionPayload";
import type { Context } from "@@/server/trpc/context";

import { requireCallSession } from "@@/server/services/message/call/requireCallSession";
import { isMember } from "@@/server/trpc/middleware/userToRoom/isMember";

export const requireReadableCallSession = async (
  db: Context["db"],
  sessionPayload: GetSessionPayload,
  callSessionId: string,
) => {
  const callSession = await requireCallSession(db, callSessionId);
  if (callSession.roomId) await isMember(db, sessionPayload, callSession.roomId);
  return callSession;
};
