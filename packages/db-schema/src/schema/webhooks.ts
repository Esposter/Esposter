import type { Room } from "@/schema/rooms";
import type { User } from "@/schema/users";

import { createNameCheckSql, createNameSchema } from "@/models/shared/Name";
import { pgTable } from "@/pgTable";
import { appUsers } from "@/schema/appUsers";
import { messageSchema } from "@/schema/messageSchema";
import { rooms } from "@/schema/rooms";
import { users } from "@/schema/users";
import { relations } from "drizzle-orm";
import { boolean, check, text, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";

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
      .references(() => appUsers.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ name }) => [check("name", createNameCheckSql(name, WEBHOOK_NAME_MAX_LENGTH))],
    schema: messageSchema,
  },
);

export type Webhook = typeof webhooks.$inferSelect;

export const selectWebhookSchema = createSelectSchema(webhooks, {
  name: createNameSchema(WEBHOOK_NAME_MAX_LENGTH),
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
  user: one(appUsers, {
    fields: [webhooks.userId],
    references: [appUsers.id],
  }),
}));
// @TODO: https://github.com/drizzle-team/drizzle-orm/issues/695
export const WebhookRelations = {
  room: true,
  user: true,
} as const;
export type WebhookWithRelations = Webhook & { room: Room; user: User };
