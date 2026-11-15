import { usersInAuth } from "#src/schema/auth/usersInAuth";
import { roomsInMessage } from "#src/schema/message/roomsInMessage";
import { text } from "drizzle-orm/sqlite-core";

// The room a moderation row is about and the member it is taken against, each cascading with its own record
// A log or note goes with its room, and a member's record goes with their account, as their ban does
export const createRoomTargetUserColumns = () => ({
  roomId: text()
    .notNull()
    .references(() => roomsInMessage.id, { onDelete: "cascade" }),
  targetUserId: text()
    .notNull()
    .references(() => usersInAuth.id, { onDelete: "cascade" }),
});
