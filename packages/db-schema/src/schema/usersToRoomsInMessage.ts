import { NotificationType, notificationTypeSchema } from "#src/models/message/NotificationType";
import { pgTable } from "#src/pgTable";
import { messageSchema } from "#src/schema/messageSchema";
import { roomsInMessage } from "#src/schema/roomsInMessage";
import { users } from "#src/schema/users";
import { NICKNAME_MAX_LENGTH } from "#src/services/room/constants";
import { createMaxLengthCheckSql } from "#src/services/shared/createMaxLengthCheckSql";
import { createMinimumCheckSql } from "#src/services/shared/createMinimumCheckSql";
import { createNormalizedStringSchema } from "@esposter/shared";
import { sql } from "drizzle-orm";
import { boolean, check, index, integer, pgEnum, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";

export const notificationTypeEnum = pgEnum("notificationType", NotificationType);

export const usersToRoomsInMessage = pgTable(
  "usersToRooms",
  {
    isHidden: boolean().notNull().default(false),
    lastMessageAt: timestamp(),
    mentionCount: integer().notNull().default(0),
    nickname: text().notNull().default(""),
    notificationType: notificationTypeEnum().notNull().default(NotificationType.DirectMessage),
    roomId: uuid()
      .notNull()
      .references(() => roomsInMessage.id, { onDelete: "cascade" }),
    timeoutUntil: timestamp(),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ mentionCount, nickname, roomId, timeoutUntil, userId }) => [
      primaryKey({ columns: [userId, roomId] }),
      check("usersToRooms_nickname_length_check", createMaxLengthCheckSql(nickname, NICKNAME_MAX_LENGTH)),
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
  mentionCount: (schema) => schema.nonnegative(),
  nickname: (schema) => createNormalizedStringSchema(NICKNAME_MAX_LENGTH, schema),
  notificationType: notificationTypeSchema,
});
