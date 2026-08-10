import type { Context } from "@@/server/trpc/context";

import { createId } from "#shared/util/math/random/createId";
import { MAX_CALL_SESSION_ID_ATTEMPTS } from "@@/server/services/message/call/constants";
import { CALL_ID_LENGTH, callSessionsInMessage, DatabaseEntityType } from "@esposter/db-schema";
import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

export const createStandaloneCallSessionId = async (db: Context["db"], userId: string): Promise<string> => {
  for (let attempt = 0; attempt < MAX_CALL_SESSION_ID_ATTEMPTS; attempt++) {
    const id = createId(CALL_ID_LENGTH);
    const result = await getResultAsync(() =>
      db.insert(callSessionsInMessage).values({ id, userId }).returning(),
    ).match(
      (value) => value[0]?.id,
      (error) => {
        if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") return undefined;
        throw error;
      },
    );
    if (result) return result;
  }

  throw new TRPCError({
    code: "UNPROCESSABLE_CONTENT",
    message: new InvalidOperationError(
      Operation.Create,
      DatabaseEntityType.CallSession,
      createStandaloneCallSessionId.name,
    ).message,
  });
};
