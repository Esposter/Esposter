import type { RoomInMessage } from "@/schema/roomsInMessage";
import type { User } from "@/schema/users";

import { pgTable } from "@/pgTable";
import { appUsersInMessage } from "@/schema/appUsersInMessage";
import { messageSchema } from "@/schema/messageSchema";
import { roomsInMessage } from "@/schema/roomsInMessage";
import { users } from "@/schema/users";
import { sql } from "drizzle-orm";
import { boolean, text, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const WEBHOOK_NAME_MAX_LENGTH = 100;

export const webhooksInMessage = pgTable(
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
      .references(() => roomsInMessage.id, { onDelete: "cascade" }),
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

export type WebhookInMessage = typeof webhooksInMessage.$inferSelect;

export const selectWebhookInMessageSchema = createSelectSchema(webhooksInMessage, {
  name: z.string().min(1).max(WEBHOOK_NAME_MAX_LENGTH),
});

// @TODO: https://github.com/drizzle-team/drizzle-orm/issues/695
export const WebhookInMessageRelations = {
  roomInMessage: true,
  user: true,
} as const;
export type WebhookInMessageWithRelations = WebhookInMessage & { roomInMessage: RoomInMessage; user: User };
