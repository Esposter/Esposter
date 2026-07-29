import type { Context } from "@@/server/trpc/context";

import { executeAutomodAction } from "@@/server/services/message/moderation/executeAutomodAction";
import { getMessageCreationRejection } from "@esposter/db";
import { MessageCreationRejectionType } from "@esposter/db-schema";
import { WordFilteredError } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

// The tRPC face of the shared message-creation rules — the decision itself lives in `@esposter/db` so the
// Function worker's delivery path cannot drift from what the composer enforces.
export const assertCanCreateMessage = async (
  db: Context["db"],
  userId: string,
  roomId: string,
  message?: string,
): Promise<void> => {
  const rejection = await getMessageCreationRejection(db, userId, roomId, message);
  if (!rejection) return;
  else if (rejection.type === MessageCreationRejectionType.Slowmode) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
  else if (rejection.type !== MessageCreationRejectionType.WordFilter) throw new TRPCError({ code: "FORBIDDEN" });

  // The configured action (warn/timeout) runs before the message is rejected — Discord blocks and acts.
  await executeAutomodAction(db, {
    action: rejection.filter.action,
    roomId,
    timeoutDurationMs: rejection.filter.timeoutDurationMs,
    userId,
  });
  // The `cause` marks the one rejection that has already spent a consequence, so a caller re-checking a
  // Stored message (send-now on a scheduled job) can burn the job rather than leave it for the worker to
  // Block — and punish — a second time. Every other rejection is safe to re-run.
  throw new TRPCError({
    cause: new WordFilteredError("Message contains blocked content."),
    code: "FORBIDDEN",
    message: "Message contains blocked content.",
  });
};
