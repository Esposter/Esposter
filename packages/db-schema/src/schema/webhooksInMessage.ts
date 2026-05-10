import { createNameCheckSql, createNameSchema } from "@/models/shared/Name";
import { pgTable } from "@/pgTable";
import { appUsersInMessage } from "@/schema/appUsersInMessage";
import { messageSchema } from "@/schema/messageSchema";
import { roomsInMessage } from "@/schema/roomsInMessage";
import { users } from "@/schema/users";
import { boolean, check, text, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";

export const WEBHOOK_NAME_MAX_LENGTH = 100;

export const webhooksInMessage = pgTable(
  "webhooks",
  {
    creatorId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    id: uuid().primaryKey().defaultRandom(),
    isActive: boolean().notNull().default(true),
    name: text().notNull().default(""),
    roomId: uuid()
      .notNull()
      .references(() => roomsInMessage.id, { onDelete: "cascade" }),
    token: text().notNull(),
    userId: uuid()
      .notNull()
      // 1:1 with appUsers
      .unique()
      .references(() => appUsersInMessage.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ name }) => [check("webhooks_name_length_check", createNameCheckSql(name, WEBHOOK_NAME_MAX_LENGTH))],
    schema: messageSchema,
  },
);

export type WebhookInMessage = typeof webhooksInMessage.$inferSelect;

export const selectWebhookInMessageSchema = createSelectSchema(webhooksInMessage, {
  name: (schema) => createNameSchema(WEBHOOK_NAME_MAX_LENGTH, schema),
});
