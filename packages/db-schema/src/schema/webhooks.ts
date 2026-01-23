import type { Room } from "@/schema/rooms";
import type { User } from "@/schema/users";

import { pgTable } from "@/pgTable";
import { appUsersInMessage } from "@/schema/appUsersInMessage";
import { messageSchema } from "@/schema/messageSchema";
import { rooms } from "@/schema/rooms";
import { users } from "@/schema/users";
import { relations, sql } from "drizzle-orm";
import { boolean, text, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const WEBHOOK_NAME_MAX_LENGTH = 100;

export const webhooks = pgTable(
  "webhooks",
  {
    creatorId: text("creator_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    id: uuid("id").primaryKey().defaultRandom(),
    isActive: boolean("is_active").notNull().default(true),
    name: text("name").notNull().default(""),
    roomId: uuid("room_id")
      .notNull()
      .references(() => rooms.id, { onDelete: "cascade" }),
    token: text("token").notNull(),
    userId: uuid("user_id")
      .notNull()
      // 1:1 with appUsers
      .unique()
      .references(() => appUsersInMessage.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ name }) => [
      sql`CHECK (LENGTH(${name}) >= 1 AND LENGTH(${name}) <= ${sql.raw(WEBHOOK_NAME_MAX_LENGTH.toString())})`,
    ],
    schema: messageSchema,
  },
);

export type Webhook = typeof webhooks.$inferSelect;

export const selectWebhookSchema = createSelectSchema(webhooks, {
  name: z.string().min(1).max(WEBHOOK_NAME_MAX_LENGTH),
});

export const webhooksRelations = relations(webhooks, ({ one }) => ({
  creator: one(users, {
    fields: [webhooks.creatorId],
    references: [users.id],
  }),
  room: one(rooms, {
    fields: [webhooks.roomId],
    references: [rooms.id],
  }),
  user: one(appUsersInMessage, {
    fields: [webhooks.userId],
    references: [appUsersInMessage.id],
  }),
}));
// @TODO: https://github.com/drizzle-team/drizzle-orm/issues/695
export const WebhookRelations = {
  room: true,
  user: true,
} as const;
export type WebhookWithRelations = Webhook & { room: Room; user: User };
