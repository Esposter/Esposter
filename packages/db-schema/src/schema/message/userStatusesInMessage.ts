import { UserStatus, userStatusSchema } from "#src/models/user/UserStatus";
import { usersInAuth } from "#src/schema/auth/usersInAuth";
import { messageSchema } from "#src/schema/message/messageSchema";
import { createEnumColumn } from "#src/services/shared/createEnumColumn";
import { createMaxLengthCheckSql } from "#src/services/shared/createMaxLengthCheckSql";
import { STATUS_MESSAGE_MAX_LENGTH } from "#src/services/user/constants";
import { sqliteTable } from "#src/sqliteTable";
import { check, integer, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-orm/zod";

export const userStatusesInMessage = sqliteTable(
  "userStatuses",
  {
    expiresAt: integer({ mode: "timestamp_ms" }),
    isConnected: integer({ mode: "boolean" }).notNull().default(true),
    message: text().notNull().default(""),
    // This is only used if the user manually sets a status
    status: createEnumColumn(UserStatus),
    userId: text()
      .primaryKey()
      .references(() => usersInAuth.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ message }) => [
      check("userStatuses_message_length_check", createMaxLengthCheckSql(message, STATUS_MESSAGE_MAX_LENGTH)),
    ],
    schema: messageSchema,
  },
);

export type UserStatusInMessage = typeof userStatusesInMessage.$inferSelect;

export const selectUserStatusInMessageSchema = createSelectSchema(userStatusesInMessage, {
  message: (schema) => schema.max(STATUS_MESSAGE_MAX_LENGTH),
  // eslint-disable-next-line no-restricted-syntax -- refines the Drizzle column's own nullable status
  status: userStatusSchema.nullable(),
});
