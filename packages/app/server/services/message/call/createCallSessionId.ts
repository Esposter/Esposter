import type { Context } from "@@/server/trpc/context";

import { createId } from "#shared/util/math/random/createId";
import { readCallSessionId } from "@@/server/services/message/call/readCallSessionId";
import { CALL_ID_LENGTH, callSessionsInMessage, DatabaseEntityType } from "@esposter/db-schema";
import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

export const createCallSessionId = async (db: Context["db"], roomId: string, userId: string): Promise<string> => {
  for (let i = 0; i < 3; i++) {
    const existingCallSessionId = await readCallSessionId(db, roomId);
    if (existingCallSessionId) return existingCallSessionId;
    const id = createId(CALL_ID_LENGTH);
    const callSession = await getResultAsync(() =>
      db.insert(callSessionsInMessage).values({ id, roomId, userId }).returning(),
    )
      .orTee(console.error)
      .unwrapOr(null);
    if (callSession?.[0]) return callSession[0].id;
  }

  const callSession = await db.query.callSessionsInMessage.findFirst({ where: { roomId: { eq: roomId } } });
  if (!callSession)
    throw new TRPCError({
      code: "UNPROCESSABLE_CONTENT",
      message: new InvalidOperationError(Operation.Create, DatabaseEntityType.CallSession, roomId).message,
    });
  return callSession.id;
};
