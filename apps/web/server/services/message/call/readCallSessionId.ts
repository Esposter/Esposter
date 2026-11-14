import type { Context } from "#server/trpc/context";
import type { CallSessionInMessage } from "@esposter/db-schema";

// A room runs its own call and one per thread, so a session is addressed by both — the empty root rowKey is
// The room's own call
export const readCallSessionId = async (
  db: Context["db"],
  roomId: string,
  threadRootId: CallSessionInMessage["threadRootId"] = 0,
): Promise<string> => {
  const callSession = await db.query.callSessionsInMessage.findFirst({
    where: { roomId: { eq: roomId }, threadRootId: { eq: threadRootId } },
  });
  return callSession?.id ?? "";
};
