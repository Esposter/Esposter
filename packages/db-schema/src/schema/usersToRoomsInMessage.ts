import { createNormalizedStringSchema } from "@/models/shared/Name";
import { pgTable } from "@/pgTable";
import { messageSchema } from "@/schema/messageSchema";
import { roomsInMessage } from "@/schema/roomsInMessage";
import { users } from "@/schema/users";
import { sql } from "drizzle-orm";
import { boolean, check, index, pgEnum, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";

export enum NotificationType {
  All = "All",
  DirectMessage = "DirectMessage",
  Never = "Never",
}

export const notificationTypeSchema = z.enum(NotificationType) satisfies z.ZodType<NotificationType>;

export const notificationTypeEnum = pgEnum("notification_type", NotificationType);

export const NICKNAME_MAX_LENGTH = 32;

export const usersToRoomsInMessage = pgTable(
  "usersToRooms",
  {
    isHidden: boolean().notNull().default(false),
    lastMessageAt: timestamp(),
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
    extraConfig: ({ nickname, roomId, timeoutUntil, userId }) => [
      primaryKey({ columns: [userId, roomId] }),
      check(
        "users_to_rooms_nickname_length_check",
        sql`LENGTH(${nickname}) <= ${sql.raw(NICKNAME_MAX_LENGTH.toString())}`,
      ),
      index("users_to_rooms_timeout_until_index")
        .on(timeoutUntil)
        .where(sql`${timeoutUntil} IS NOT NULL`),
    ],
    schema: messageSchema,
  },
);

export type UserToRoomInMessage = typeof usersToRoomsInMessage.$inferSelect;

export const selectUserToRoomInMessageSchema = createSelectSchema(usersToRoomsInMessage, {
  nickname: (schema) => createNormalizedStringSchema(NICKNAME_MAX_LENGTH, schema),
  notificationType: notificationTypeSchema,
});
