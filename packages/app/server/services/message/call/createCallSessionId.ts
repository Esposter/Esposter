import type { Context } from "@@/server/trpc/context";

import { MAX_CALL_SESSION_ID_ATTEMPTS } from "@@/server/services/message/call/constants";
import { insertCallSessionId } from "@@/server/services/message/call/insertCallSessionId";
import { readCallSessionId } from "@@/server/services/message/call/readCallSessionId";
import { DatabaseEntityType } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

export const createCallSessionId = async (
  db: Context["db"],
  roomId: string,
  userId: string,
  threadRootRowKey = "",
): Promise<string> => {
  for (let attempt = 0; attempt < MAX_CALL_SESSION_ID_ATTEMPTS; attempt++) {
    const existingCallSessionId = await readCallSessionId(db, roomId, threadRootRowKey);
    if (existingCallSessionId) return existingCallSessionId;
    const callSessionId = await insertCallSessionId(db, { roomId, threadRootRowKey, userId });
    if (callSessionId) return callSessionId;
  }
  // Every attempt lost the race to another creator, so the session is whatever they landed
  const callSessionId = await readCallSessionId(db, roomId, threadRootRowKey);
  if (!callSessionId)
    throw new TRPCError({
      code: "UNPROCESSABLE_CONTENT",
      message: new InvalidOperationError(Operation.Create, DatabaseEntityType.CallSession, roomId).message,
    });
  return callSessionId;
};
