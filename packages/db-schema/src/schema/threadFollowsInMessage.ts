import { pgTable } from "@/pgTable";
import { messageSchema } from "@/schema/messageSchema";
import { roomsInMessage } from "@/schema/roomsInMessage";
import { users } from "@/schema/users";
import { primaryKey, text, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";

export const threadFollowsInMessage = pgTable(
  "threadFollows",
  {
    roomId: uuid()
      .notNull()
      .references(() => roomsInMessage.id, { onDelete: "cascade" }),
    threadRootRowKey: text().notNull(),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ roomId, threadRootRowKey, userId }) => [
      primaryKey({ columns: [userId, roomId, threadRootRowKey] }),
    ],
    schema: messageSchema,
  },
);

export type ThreadFollowInMessage = typeof threadFollowsInMessage.$inferSelect;

export const selectThreadFollowInMessageSchema = createSelectSchema(threadFollowsInMessage);
