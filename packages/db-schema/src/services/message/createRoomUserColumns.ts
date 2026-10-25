import { usersInAuth } from "#src/schema/auth/usersInAuth";
import { roomsInMessage } from "#src/schema/message/roomsInMessage";
import { text, uuid } from "drizzle-orm/pg-core";

export const createRoomUserColumns = () => ({
  roomId: uuid()
    .notNull()
    .references(() => roomsInMessage.id, { onDelete: "cascade" }),
  userId: text()
    .notNull()
    .references(() => usersInAuth.id, { onDelete: "cascade" }),
});
