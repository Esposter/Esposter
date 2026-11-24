import type { Context } from "#server/trpc/context";
import type { RoomMessage } from "@esposter/db-schema";

import { applyMentionCounts } from "#server/services/message/applyMentionCounts";
import { incrementMentionCounts } from "@esposter/db";

// The mention counts an edited message's new text makes, for the members it names.
// A webhook's message is never counted, so it makes none.
export const addMentionCounts = async (
  db: Context["db"],
  roomId: string,
  message: Pick<RoomMessage, "message" | "userId">,
): Promise<void> => {
  if (!message.userId) return;

  await applyMentionCounts(() =>
    incrementMentionCounts(db, { message: message.message, roomId, userId: message.userId }),
  );
};
