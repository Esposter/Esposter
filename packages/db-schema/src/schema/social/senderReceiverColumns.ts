import { usersInAuth } from "#src/schema/auth/usersInAuth";
import { text } from "drizzle-orm/pg-core";

export const createSenderReceiverColumns = () => ({
  receiverId: text()
    .notNull()
    .references(() => usersInAuth.id, { onDelete: "cascade" }),
  senderId: text()
    .notNull()
    .references(() => usersInAuth.id, { onDelete: "cascade" }),
});
