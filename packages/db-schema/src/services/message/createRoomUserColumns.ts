import { usersInAuth } from "#src/schema/auth/usersInAuth";
import { roomsInMessage } from "#src/schema/message/roomsInMessage";
import { text } from "drizzle-orm/sqlite-core";

export const createRoomUserColumns = () => ({
  roomId: text()
    .notNull()
    .references(() => roomsInMessage.id, { onDelete: "cascade" }),
  userId: text()
    .notNull()
    .references(() => usersInAuth.id, { onDelete: "cascade" }),
});
