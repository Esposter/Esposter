import type { Context } from "@@/server/trpc/context";

import { DatabaseEntityType } from "@esposter/db-schema";
import { NotFoundError } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

export const requireCallSession = async (db: Context["db"], callSessionId: string) => {
  const callSession = await db.query.callSessionsInMessage.findFirst({
    where: { id: { eq: callSessionId } },
  });
  if (!callSession)
    throw new TRPCError({
      code: "NOT_FOUND",
      message: new NotFoundError(DatabaseEntityType.CallSession, callSessionId).message,
    });
  return callSession;
};
