import type { Context } from "#server/trpc/context";
import type { RoomMessage } from "@esposter/db-schema";

import { applyMentionCounts } from "#server/services/message/applyMentionCounts";
import { decrementMentionCounts } from "@esposter/db";

// The mention counts a message made are taken back when it is deleted, or edited away from them
export const takeBackMentionCounts = (
  db: Context["db"],
  roomId: string,
  message: Pick<RoomMessage, "createdAt" | "editedAt" | "message"> & { userId: string },
): Promise<void> => applyMentionCounts(() => decrementMentionCounts(db, { ...message, roomId }));
