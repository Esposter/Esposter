import type { MessageCreationRejection } from "#src/models/message/moderation/MessageCreationRejection";
import type { Database } from "@esposter/db-schema";

import { getMessageCreationRejection } from "#src/services/message/moderation/getMessageCreationRejection";
import { usersToRoomsInMessage } from "@esposter/db-schema";
import { and, eq, isNull } from "drizzle-orm";

// Every send takes this before its message is written: the gate decides on the sender's slowmode clock, and the send
// Claims that clock in one write guarded on the value the gate read. A claim lost to a racing send of the same member's
// Decides again on the clock that won, so slowmode refuses it when the room has slowmode and a room without it takes
// The send. Each loss means another send landed, so it ends. The live send and the scheduled send both claim here
export const claimMessageSendSlot = async (
  db: Database,
  userId: string,
  roomId: string,
  message: string | undefined,
  now: Date,
): Promise<MessageCreationRejection | undefined> => {
  const member = await db.query.usersToRoomsInMessage.findFirst({
    columns: { lastMessageAt: true },
    where: { roomId: { eq: roomId }, userId: { eq: userId } },
  });
  const rejection = await getMessageCreationRejection(db, userId, roomId, message);
  if (rejection) return rejection;

  const claimed = await db
    .update(usersToRoomsInMessage)
    .set({ lastMessageAt: now })
    .where(
      and(
        eq(usersToRoomsInMessage.roomId, roomId),
        eq(usersToRoomsInMessage.userId, userId),
        member?.lastMessageAt
          ? eq(usersToRoomsInMessage.lastMessageAt, member.lastMessageAt)
          : isNull(usersToRoomsInMessage.lastMessageAt),
      ),
    )
    .returning({ userId: usersToRoomsInMessage.userId });
  if (claimed.length > 0) return undefined;
  return claimMessageSendSlot(db, userId, roomId, message, now);
};
