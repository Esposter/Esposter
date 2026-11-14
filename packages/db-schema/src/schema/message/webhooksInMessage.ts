import { usersInAuth } from "#src/schema/auth/usersInAuth";
import { appUsersInMessage } from "#src/schema/message/appUsersInMessage";
import { messageSchema } from "#src/schema/message/messageSchema";
import { roomsInMessage } from "#src/schema/message/roomsInMessage";
import { WEBHOOK_NAME_MAX_LENGTH } from "#src/services/message/webhook/constants";
import { createNameCheckSql } from "#src/services/shared/createNameCheckSql";
import { createNameSchema } from "#src/services/shared/createNameSchema";
import { sqliteTable } from "#src/sqliteTable";
import { secretTokenSchema } from "@esposter/shared";
import { check, index, integer, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-orm/zod";
import { v7 } from "uuid";
import { z } from "zod";

export const webhooksInMessage = sqliteTable(
  "webhooks",
  {
    creatorId: text()
      .notNull()
      .references(() => usersInAuth.id, { onDelete: "cascade" }),
    id: text()
      .primaryKey()
      .$defaultFn(() => v7()),
    isActive: integer({ mode: "boolean" }).notNull().default(true),
    name: text().notNull(),
    roomId: text()
      .notNull()
      .references(() => roomsInMessage.id, { onDelete: "cascade" }),
    // The credential in the delivery url, a 256-bit secret from `generateSecretToken`
    token: text().notNull(),
    userId: text()
      .notNull()
      // 1:1 with appUsers
      .unique()
      .references(() => appUsersInMessage.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ name, roomId }) => [
      check("webhooks_name_length_check", createNameCheckSql(name, WEBHOOK_NAME_MAX_LENGTH)),
      // A room's webhook list and its create-time count read by room, and its deletion cascades through it
      index("webhooks_roomId_index").on(roomId),
    ],
    schema: messageSchema,
  },
);

export type WebhookInMessage = typeof webhooksInMessage.$inferSelect;

export const selectWebhookInMessageSchema = createSelectSchema(webhooksInMessage, {
  id: () => z.uuidv7(),
  name: (schema) => createNameSchema(WEBHOOK_NAME_MAX_LENGTH, schema),
  roomId: () => z.uuidv7(),
  token: () => secretTokenSchema,
  userId: () => z.uuidv7(),
});
