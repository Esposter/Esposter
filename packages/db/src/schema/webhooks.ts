import type { Room } from "@/schema/rooms";
import type { User } from "@/schema/users";

import { pgTable } from "@/pgTable";
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
    id: uuid("id").primaryKey().defaultRandom(),
    isActive: boolean("is_active").notNull().default(true),
    name: text("name").notNull().default(""),
    roomId: uuid("room_id")
      .notNull()
      .references(() => rooms.id, { onDelete: "cascade" }),
    token: text("token").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
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
  room: one(rooms, {
    fields: [webhooks.roomId],
    references: [rooms.id],
  }),
  user: one(users, {
    fields: [webhooks.userId],
    references: [users.id],
  }),
}));
// @TODO: https://github.com/drizzle-team/drizzle-orm/issues/695
export const WebhookRelations = {
  room: true,
  user: true,
} as const;
export type WebhookWithRelations = Webhook & { room: Room; user: User };
