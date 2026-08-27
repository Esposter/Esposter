import { getNotFoundError } from "@@/server/trpc/guards/getNotFoundError";
import type { Context } from "@@/server/trpc/context";

import { DatabaseEntityType } from "@esposter/db-schema";

export const requireCallSession = async (db: Context["db"], callSessionId: string) => {
  const callSession = await db.query.callSessionsInMessage.findFirst({
    where: { id: { eq: callSessionId } },
  });
  if (!callSession) throw getNotFoundError(DatabaseEntityType.CallSession, callSessionId);
  return callSession;
};
