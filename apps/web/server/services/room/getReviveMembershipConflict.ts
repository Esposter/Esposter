import { usersToRoomsInMessage } from "@esposter/db-schema";
import { isNotNull, sql } from "drizzle-orm";

// A membership a removal left as a tombstone is revived by its conflict: the removal is cleared, and the row takes the
// Values a fresh membership is inserted with, so a rejoin reads as a new membership rather than the one that left. The
// Set-where names only a tombstone, so a live membership is left alone and a repeat insert raises no version
const excluded = (column: { name: string }) => sql`excluded.${sql.identifier(column.name)}`;

export const getReviveMembershipConflict = () => ({
  set: {
    categoryId: excluded(usersToRoomsInMessage.categoryId),
    createdAt: excluded(usersToRoomsInMessage.createdAt),
    deletedAt: null,
    displayName: excluded(usersToRoomsInMessage.displayName),
    isHidden: excluded(usersToRoomsInMessage.isHidden),
    lastMessageAt: excluded(usersToRoomsInMessage.lastMessageAt),
    lastReadAt: excluded(usersToRoomsInMessage.lastReadAt),
    mentionCount: excluded(usersToRoomsInMessage.mentionCount),
    notificationType: excluded(usersToRoomsInMessage.notificationType),
    timeoutUntil: excluded(usersToRoomsInMessage.timeoutUntil),
  },
  setWhere: isNotNull(usersToRoomsInMessage.deletedAt),
  target: [usersToRoomsInMessage.userId, usersToRoomsInMessage.roomId],
});
