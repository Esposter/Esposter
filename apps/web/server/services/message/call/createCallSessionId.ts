/* oxlint-disable no-await-in-loop -- Retry: the next attempt runs only because this one lost the race for the room's id */
import type { Context } from "#server/trpc/context";
import type { CallSessionInMessage } from "@esposter/db-schema";

import { MAX_CALL_SESSION_ID_ATTEMPTS } from "#server/services/message/call/constants";
import { insertCallSessionId } from "#server/services/message/call/insertCallSessionId";
import { readCallSessionId } from "#server/services/message/call/readCallSessionId";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { DatabaseEntityType } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";

export const createCallSessionId = async (
  db: Context["db"],
  roomId: string,
  userId: string,
  threadRootId: CallSessionInMessage["threadRootId"] = 0,
): Promise<string> => {
  for (let attempt = 0; attempt < MAX_CALL_SESSION_ID_ATTEMPTS; attempt++) {
    const existingCallSessionId = await readCallSessionId(db, roomId, threadRootId);
    if (existingCallSessionId) return existingCallSessionId;
    const callSessionId = await insertCallSessionId(db, { roomId, threadRootId, userId });
    if (callSessionId) return callSessionId;
  }
  // Every attempt lost the race to another creator, so the session is whatever they landed
  const callSessionId = await readCallSessionId(db, roomId, threadRootId);
  if (!callSessionId)
    throw getInvalidOperationError(Operation.Create, DatabaseEntityType.CallSession, roomId, "UNPROCESSABLE_CONTENT");
  return callSessionId;
};
