import type { Context } from "@@/server/trpc/context";

// A room runs its own call and one per thread, so a session is addressed by both — the empty root rowKey is
// The room's own call
export const readCallSessionId = async (db: Context["db"], roomId: string, threadRootRowKey = ""): Promise<string> => {
  const callSession = await db.query.callSessionsInMessage.findFirst({
    where: { roomId: { eq: roomId }, threadRootRowKey: { eq: threadRootRowKey } },
  });
  return callSession?.id ?? "";
};
