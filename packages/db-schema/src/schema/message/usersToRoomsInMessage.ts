import { NotificationType, notificationTypeSchema } from "#src/models/message/NotificationType";
import { pgTable } from "#src/pgTable";
import { usersInAuth } from "#src/schema/auth/usersInAuth";
import { messageSchema } from "#src/schema/message/messageSchema";
import { roomsInMessage } from "#src/schema/message/roomsInMessage";
import { DISPLAY_NAME_MAX_LENGTH } from "#src/services/room/constants";
import { createMaxLengthCheckSql } from "#src/services/shared/createMaxLengthCheckSql";
import { createMinimumCheckSql } from "#src/services/shared/createMinimumCheckSql";
import { createNormalizedStringSchema } from "@esposter/shared";
import { sql } from "drizzle-orm";
import { boolean, check, index, integer, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";

export const notificationTypeEnum = messageSchema.enum("notificationType", NotificationType);

export const usersToRoomsInMessage = pgTable(
  "usersToRooms",
  {
    displayName: text().notNull().default(""),
    isHidden: boolean().notNull().default(false),
    lastMessageAt: timestamp(),
    lastReadAt: timestamp(),
    mentionCount: integer().notNull().default(0),
    notificationType: notificationTypeEnum().notNull().default(NotificationType.DirectMessage),
    roomId: uuid()
      .notNull()
      .references(() => roomsInMessage.id, { onDelete: "cascade" }),
    timeoutUntil: timestamp(),
    userId: text()
      .notNull()
      .references(() => usersInAuth.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ displayName, mentionCount, roomId, timeoutUntil, userId }) => [
      primaryKey({ columns: [userId, roomId] }),
      check("usersToRooms_displayName_length_check", createMaxLengthCheckSql(displayName, DISPLAY_NAME_MAX_LENGTH)),
      check("usersToRooms_mentionCount_check", createMinimumCheckSql(mentionCount, 0)),
      index("usersToRooms_timeoutUntil_index")
        .on(timeoutUntil)
        .where(sql`${timeoutUntil} IS NOT NULL`),
    ],
    schema: messageSchema,
  },
);

export type UserToRoomInMessage = typeof usersToRoomsInMessage.$inferSelect;

export const selectUserToRoomInMessageSchema = createSelectSchema(usersToRoomsInMessage, {
  displayName: (schema) => createNormalizedStringSchema(DISPLAY_NAME_MAX_LENGTH, schema),
  mentionCount: (schema) => schema.nonnegative(),
  notificationType: notificationTypeSchema,
});
