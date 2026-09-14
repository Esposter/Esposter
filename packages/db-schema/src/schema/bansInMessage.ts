import { pgTable } from "#src/pgTable";
import { messageSchema } from "#src/schema/messageSchema";
import { roomsInMessage } from "#src/schema/roomsInMessage";
import { users } from "#src/schema/users";
import { primaryKey, text, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";

export const bansInMessage = pgTable(
  "bans",
  {
    // The audit record outlives the moderator's account: their row going nulls this rather than taking the ban
    bannedByUserId: text().references(() => users.id, { onDelete: "set null" }),
    roomId: uuid()
      .notNull()
      .references(() => roomsInMessage.id, { onDelete: "cascade" }),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ roomId, userId }) => [primaryKey({ columns: [roomId, userId] })],
    schema: messageSchema,
  },
);

export type BanInMessage = typeof bansInMessage.$inferSelect;

export const selectBanInMessageSchema = createSelectSchema(bansInMessage);
