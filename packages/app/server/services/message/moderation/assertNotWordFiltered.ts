import type { Context } from "@@/server/trpc/context";
import type { RoomFilterInMessage } from "@esposter/db-schema";

import { executeAutomodAction } from "@@/server/services/message/moderation/executeAutomodAction";
import { WordFilteredError } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

export const assertNotWordFiltered = async (
  db: Context["db"],
  roomId: string,
  userId: string,
  filter: Pick<RoomFilterInMessage, "action" | "timeoutDurationMs" | "words"> | undefined,
  messageText: string,
  getCanManageMessages: () => Promise<boolean>,
): Promise<void> => {
  if (!filter?.words.length) return;

  const normalizedMessageText = messageText.toLowerCase();
  if (!filter.words.some((word) => normalizedMessageText.includes(word.toLowerCase()))) return;
  else if (await getCanManageMessages()) return;
  else {
    // The configured action (warn/timeout) runs before the message is rejected — Discord blocks and acts.
    await executeAutomodAction(db, {
      action: filter.action,
      roomId,
      timeoutDurationMs: filter.timeoutDurationMs,
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
  }
};
