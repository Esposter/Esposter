import type { User } from "@/schema/users";

import { pgTable } from "@/pgTable";
import { messageSchema } from "@/schema/messageSchema";
import { roomsInMessage } from "@/schema/roomsInMessage";
import { users } from "@/schema/users";
import { primaryKey, text, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";

export const bansInMessage = pgTable(
  "bans",
  {
    // No FK — audit record must survive moderator account deletion
    bannedByUserId: text("bannedByUserId"),
    roomId: uuid("roomId")
      .notNull()
      .references(() => roomsInMessage.id, { onDelete: "cascade" }),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ roomId, userId }) => [primaryKey({ columns: [roomId, userId] })],
    schema: messageSchema,
  },
);

export type BanInMessage = typeof bansInMessage.$inferSelect;
export type BanInMessageWithRelations = BanInMessage & { bannedByUser: null | User; user: User };

export const selectBanInMessageSchema = createSelectSchema(bansInMessage);
