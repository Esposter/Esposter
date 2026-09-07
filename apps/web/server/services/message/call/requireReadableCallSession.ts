import type { GetSessionPayload } from "#shared/models/auth/GetSessionPayload";
import type { Context } from "@@/server/trpc/context";

import { requireCallSession } from "@@/server/services/message/call/requireCallSession";
import { assertIsMember } from "@@/server/trpc/middleware/userToRoom/assertIsMember";

export const requireReadableCallSession = async (
  db: Context["db"],
  sessionPayload: GetSessionPayload,
  callSessionId: string,
) => {
  const callSession = await requireCallSession(db, callSessionId);
  if (callSession.roomId) await assertIsMember(db, sessionPayload, callSession.roomId);
  return callSession;
};
