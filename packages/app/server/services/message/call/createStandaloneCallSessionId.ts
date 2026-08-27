import type { Context } from "@@/server/trpc/context";

import { getInvalidOperationError } from "@@/server/trpc/guards/getInvalidOperationError";
import { MAX_CALL_SESSION_ID_ATTEMPTS } from "@@/server/services/message/call/constants";
import { insertCallSessionId } from "@@/server/services/message/call/insertCallSessionId";
import { DatabaseEntityType } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";

// No room to key on, so there is nothing to re-read on exhaustion the way the room creator does — a run of
// Collisions this long is a broken generator rather than a race someone else won
export const createStandaloneCallSessionId = async (db: Context["db"], userId: string): Promise<string> => {
  for (let attempt = 0; attempt < MAX_CALL_SESSION_ID_ATTEMPTS; attempt++) {
    const callSessionId = await insertCallSessionId(db, { userId });
    if (callSessionId) return callSessionId;
  }

  throw getInvalidOperationError(
    Operation.Create,
    DatabaseEntityType.CallSession,
    createStandaloneCallSessionId.name,
    "UNPROCESSABLE_CONTENT",
  );
};
