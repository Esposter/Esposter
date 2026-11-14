import { usersInAuth } from "#src/schema/auth/usersInAuth";
import { appUsersInMessage } from "#src/schema/message/appUsersInMessage";
import { messageSchema } from "#src/schema/message/messageSchema";
import { roomsInMessage } from "#src/schema/message/roomsInMessage";
import { WEBHOOK_NAME_MAX_LENGTH } from "#src/services/message/webhook/constants";
import { createNameCheckSql } from "#src/services/shared/createNameCheckSql";
import { createNameSchema } from "#src/services/shared/createNameSchema";
import { sqliteTable } from "#src/sqliteTable";
import { SECRET_TOKEN_HASH_LENGTH } from "@esposter/shared";
import { check, index, integer, text, unique } from "drizzle-orm/sqlite-core";
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
    // The SHA-256 of the credential in the delivery url, never the credential: it is shown once, when it is issued
    tokenHash: text().notNull(),
    userId: text()
      .notNull()
      // 1:1 with appUsers
      .unique()
      .references(() => appUsersInMessage.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ name, roomId, tokenHash }) => [
      check("webhooks_name_length_check", createNameCheckSql(name, WEBHOOK_NAME_MAX_LENGTH)),
      // A room's webhook list and its create-time count read by room, and its deletion cascades through it
      index("webhooks_roomId_index").on(roomId),
      // A delivery is matched to its webhook by the hash of the credential it presents, so one lookup answers it
      unique("webhooks_tokenHash_unique").on(tokenHash),
    ],
    schema: messageSchema,
  },
);

export type WebhookInMessage = typeof webhooksInMessage.$inferSelect;

export const selectWebhookInMessageSchema = createSelectSchema(webhooksInMessage, {
  id: () => z.uuidv7(),
  name: (schema) => createNameSchema(WEBHOOK_NAME_MAX_LENGTH, schema),
  roomId: () => z.uuidv7(),
  tokenHash: () => z.hex().length(SECRET_TOKEN_HASH_LENGTH),
  userId: () => z.uuidv7(),
});
