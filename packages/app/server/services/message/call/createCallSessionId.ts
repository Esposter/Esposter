import type { Context } from "@@/server/trpc/context";

import { createId } from "#shared/util/math/random/createId";
import { readCallSessionId } from "@@/server/services/message/call/readCallSessionId";
import { CALL_ID_LENGTH, callSessionsInMessage, DatabaseEntityType } from "@esposter/db-schema";
import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

export const createCallSessionId = async (db: Context["db"], roomId: string): Promise<string> => {
  const existingId = await readCallSessionId(db, roomId);
  if (existingId) return existingId;

  let createdId: string | undefined;
  for (let i = 0; i < 3; i++) {
    const id = createId(CALL_ID_LENGTH);
    const insertResult = await getResultAsync(() =>
      db.insert(callSessionsInMessage).values({ id, roomId }).returning(),
    );
    const result = insertResult.orTee(console.error).unwrapOr(null);
    if (!result?.[0]) continue;
    createdId = result[0].id;
    break;
  }
  if (createdId) return createdId;

  const fallback = await db.query.callSessionsInMessage.findFirst({ where: { roomId: { eq: roomId } } });
  if (!fallback)
    throw new TRPCError({
      code: "UNPROCESSABLE_CONTENT",
      message: new InvalidOperationError(Operation.Create, DatabaseEntityType.CallSession, roomId).message,
    });
  return fallback.id;
};
