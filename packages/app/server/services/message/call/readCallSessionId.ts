import type { Context } from "@@/server/trpc/context";

export const readCallSessionId = async (db: Context["db"], roomId: string): Promise<string> => {
  const callSession = await db.query.callSessionsInMessage.findFirst({
    where: { roomId: { eq: roomId } },
  });
  return callSession?.id ?? "";
};
