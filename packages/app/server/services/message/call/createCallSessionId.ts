import type { Context } from "@@/server/trpc/context";

import { createId } from "#shared/util/math/random/createId";
import { MAX_CALL_SESSION_ID_ATTEMPTS } from "@@/server/services/message/call/constants";
import { readCallSessionId } from "@@/server/services/message/call/readCallSessionId";
import { CALL_ID_LENGTH, callSessionsInMessage, DatabaseEntityType } from "@esposter/db-schema";
import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

export const createCallSessionId = async (db: Context["db"], roomId: string, userId: string): Promise<string> => {
  for (let attempt = 0; attempt < MAX_CALL_SESSION_ID_ATTEMPTS; attempt++) {
    const existingCallSessionId = await readCallSessionId(db, roomId);
    if (existingCallSessionId) return existingCallSessionId;
    const id = createId(CALL_ID_LENGTH);
    const callSession = await getResultAsync(() =>
      db.insert(callSessionsInMessage).values({ id, roomId, userId }).returning(),
    )
      .orTee(console.error)
      .unwrapOr(undefined);
    if (callSession?.[0]) return callSession[0].id;
  }

  // Every attempt lost the race to another creator, so the room's session is whatever they landed
  const callSessionId = await readCallSessionId(db, roomId);
  if (!callSessionId)
    throw new TRPCError({
      code: "UNPROCESSABLE_CONTENT",
      message: new InvalidOperationError(Operation.Create, DatabaseEntityType.CallSession, roomId).message,
    });
  return callSessionId;
};
