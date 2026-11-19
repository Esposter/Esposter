import type { Context } from "#server/trpc/context";
import type { RoomMessage } from "@esposter/db-schema";

import { applyMentionCounts } from "#server/services/message/applyMentionCounts";
import { decrementMentionCounts } from "@esposter/db";

// The mention counts a message made are taken back when it is deleted, or edited away from them. A webhook's message is
// never counted, so it has none to take back
export const takeBackMentionCounts = async (
  db: Context["db"],
  roomId: string,
  message: Pick<RoomMessage, "createdAt" | "editedAt" | "message" | "userId">,
): Promise<void> => {
  if (!message.userId) return;

  await applyMentionCounts(() => decrementMentionCounts(db, { ...message, roomId }));
};
