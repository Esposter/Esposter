import type { Context } from "@@/server/trpc/context";

import { createId } from "#shared/util/math/random/createId";
import { CALL_ID_LENGTH, callSessionsInMessage, DatabaseEntityType } from "@esposter/db-schema";
import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

export const createStandaloneCallSessionId = async (db: Context["db"]): Promise<string> => {
  for (let i = 0; i < 3; i++) {
    const id = createId(CALL_ID_LENGTH);
    const callSession = await getResultAsync(() => db.insert(callSessionsInMessage).values({ id }).returning())
      .orTee(console.error)
      .unwrapOr(null);
    if (callSession?.[0]) return callSession[0].id;
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
