import type { Context } from "@@/server/trpc/context";

import { createToken } from "#shared/util/math/random/createToken";
import { CALL_TOKEN_LENGTH, callSessionsInMessage, DatabaseEntityType } from "@esposter/db-schema";
import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

export const getOrCreateCallSession = async (db: Context["db"], roomId: string) => {
  const existingCallSession = await db.query.callSessionsInMessage.findFirst({
    where: { roomId: { eq: roomId } },
  });
  if (existingCallSession) return existingCallSession;

  for (let i = 0; i < 3; i++) {
    const id = createToken(CALL_TOKEN_LENGTH);
    const insertResult = await getResultAsync(() =>
      db.insert(callSessionsInMessage).values({ id, roomId }).returning(),
    );
    const createdCallSession = insertResult.orTee(console.error).unwrapOr(null);
    if (createdCallSession?.[0]) return createdCallSession[0];
  }

  const callSessionAfterRaceCondition = await db.query.callSessionsInMessage.findFirst({
    where: { roomId: { eq: roomId } },
  });
  if (callSessionAfterRaceCondition) return callSessionAfterRaceCondition;

  throw new TRPCError({
    code: "UNPROCESSABLE_CONTENT",
    message: new InvalidOperationError(Operation.Create, DatabaseEntityType.CallSession, roomId).message,
  });
};
