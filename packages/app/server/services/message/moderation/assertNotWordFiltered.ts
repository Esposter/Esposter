import type { Context } from "@@/server/trpc/context";
import type { RoomFilterInMessage } from "@esposter/db-schema";

import { executeAutomodAction } from "@@/server/services/message/moderation/executeAutomodAction";
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
    throw new TRPCError({ code: "FORBIDDEN", message: "Message contains blocked content." });
  }
};
