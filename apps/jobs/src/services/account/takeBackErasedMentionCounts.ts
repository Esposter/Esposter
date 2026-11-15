import type { RoomMessage } from "@esposter/db-schema";

import { db } from "#src/services/shared/db";
import { getUserObject } from "#src/services/user/getUserObject";
import { decrementMentionCounts } from "@esposter/db";
import { getResultAsync, noop } from "@esposter/shared";

// The mention counts an erased message made are taken back, as a delete takes them back in the web's message router, so
// No member keeps a badge for a mention that no longer reads. Best-effort after the erase: a failure loses a badge and
// Never the erase that landed
export const takeBackErasedMentionCounts = async (
  roomId: string,
  userId: string,
  erasedMessages: RoomMessage[],
): Promise<void> => {
  await Promise.all(
    erasedMessages.map(async ({ createdAt, editedAt, message }) => {
      const rows = await getResultAsync(() =>
        decrementMentionCounts(db, { createdAt, editedAt, message, roomId, userId }),
      )
        .orTee((error) => {
          console.error("Failed to take back an erased message's mention counts", { error, roomId });
        })
        .unwrapOr([]);
      await Promise.all(
        rows.map((row) =>
          getResultAsync(() => getUserObject(row.userId).updateUserToRoom(row)).match(noop, (error) => {
            console.error("Failed to take back a member's mention count for an erased message", { error, roomId });
          }),
        ),
      );
    }),
  );
};
