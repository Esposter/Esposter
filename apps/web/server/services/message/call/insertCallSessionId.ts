import type { Context } from "@@/server/trpc/context";

import { createId } from "#shared/util/math/random/createId";
import { UNIQUE_VIOLATION_ERROR_CODE } from "@@/server/services/message/call/constants";
import { CALL_ID_LENGTH, callSessionsInMessage } from "@esposter/db-schema";
import { getResultAsync } from "@esposter/shared";

// One attempt at claiming a generated call session id. Returns the id it took, or `undefined` when that id was
// Already taken — the only case a caller may retry. Anything else throws, because it is not a collision
export const insertCallSessionId = (
  db: Context["db"],
  values: Pick<typeof callSessionsInMessage.$inferInsert, "roomId" | "threadRootRowKey" | "userId">,
): Promise<string | undefined> => {
  const id = createId(CALL_ID_LENGTH);
  return getResultAsync(() =>
    db
      .insert(callSessionsInMessage)
      .values({ ...values, id })
      .returning(),
  ).match(
    (callSessions) => callSessions[0]?.id,
    (error) => {
      if (typeof error === "object" && error !== null && "code" in error && error.code === UNIQUE_VIOLATION_ERROR_CODE)
        return undefined;
      throw error;
    },
  );
};
