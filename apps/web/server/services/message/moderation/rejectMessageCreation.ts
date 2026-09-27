import type { Context } from "@@/server/trpc/context";
import type { MessageCreationRejection } from "@esposter/db";

import { executeAutomodAction } from "@@/server/services/message/moderation/executeAutomodAction";
import { MessageCreationRejectionReasonMap } from "@@/server/services/message/moderation/MessageCreationRejectionReasonMap";
import { getForbiddenError } from "@@/server/trpc/guards/getForbiddenError";
import { MessageCreationRejectionType } from "@esposter/db-schema";
import { WordFilteredError } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

// What the tRPC side does with the shared gate's decision: nothing for none, and otherwise the error its transport
// Speaks. Apart from the decision so a caller that must decide inside a transaction applies the consequence outside
// It, where the automod write cannot be rolled back with the rejection
export const rejectMessageCreation = async (
  db: Context["db"],
  userId: string,
  roomId: string,
  rejection: MessageCreationRejection | undefined,
): Promise<void> => {
  if (!rejection) return;

  const reason = MessageCreationRejectionReasonMap[rejection.type];
  // Slowmode is the one rule waiting resolves, which is what the rate-limit code means — and the code the error
  // Link alerts on the caller's behalf
  if (rejection.type === MessageCreationRejectionType.Slowmode)
    throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: reason });
  else if (rejection.type !== MessageCreationRejectionType.WordFilter) throw getForbiddenError(reason);
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
  throw new TRPCError({ cause: new WordFilteredError(reason), code: "FORBIDDEN", message: reason });
};
