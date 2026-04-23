import type { User } from "@/schema/users";

import { pgTable } from "@/pgTable";
import { messageSchema } from "@/schema/messageSchema";
import { rooms } from "@/schema/rooms";
import { users } from "@/schema/users";
import { relations } from "drizzle-orm";
import { primaryKey, text, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";

export const bans = pgTable(
  "bans",
  {
    // No FK — audit record must survive moderator account deletion
    bannedByUserId: text("bannedByUserId"),
    roomId: uuid("roomId")
      .notNull()
      .references(() => rooms.id, { onDelete: "cascade" }),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ roomId, userId }) => [primaryKey({ columns: [roomId, userId] })],
    schema: messageSchema,
  },
);

export type Ban = typeof bans.$inferSelect;

export const selectBanSchema = createSelectSchema(bans);

export const bansRelations = relations(bans, ({ one }) => ({
  bannedByUser: one(users, {
    fields: [bans.bannedByUserId],
    references: [users.id],
  }),
  user: one(users, {
    fields: [bans.userId],
    references: [users.id],
  }),
}));
// @TODO: https://github.com/drizzle-team/drizzle-orm/issues/695
export const BanRelations = {
  bannedByUser: true,
  user: true,
} as const;

export type BanWithRelations = Ban & { bannedByUser: User | null; user: User };
