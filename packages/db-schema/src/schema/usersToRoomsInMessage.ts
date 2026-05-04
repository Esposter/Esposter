import { pgTable } from "@/pgTable";
import { messageSchema } from "@/schema/messageSchema";
import { roomsInMessage } from "@/schema/roomsInMessage";
import { users } from "@/schema/users";
import { sql } from "drizzle-orm";
import { boolean, index, pgEnum, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";

export enum NotificationType {
  All = "All",
  DirectMessage = "DirectMessage",
  Never = "Never",
}

export const notificationTypeSchema = z.enum(NotificationType) satisfies z.ZodType<NotificationType>;

export const notificationTypeEnum = pgEnum("notification_type", NotificationType);

export const usersToRoomsInMessage = pgTable(
  "users_to_rooms",
  {
    isHidden: boolean("isHidden").notNull().default(false),
    lastMessageAt: timestamp("lastMessageAt"),
    notificationType: notificationTypeEnum("notificationType").notNull().default(NotificationType.DirectMessage),
    roomId: uuid("roomId")
      .notNull()
      .references(() => roomsInMessage.id, { onDelete: "cascade" }),
    timeoutUntil: timestamp("timeoutUntil"),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ roomId, timeoutUntil, userId }) => [
      primaryKey({ columns: [userId, roomId] }),
      index("users_to_rooms_timeout_until_index")
        .on(timeoutUntil)
        .where(sql`${timeoutUntil} IS NOT NULL`),
    ],
    schema: messageSchema,
  },
);

export type UserToRoomInMessage = typeof usersToRoomsInMessage.$inferSelect;

export const selectUserToRoomInMessageSchema = createSelectSchema(usersToRoomsInMessage, {
  notificationType: notificationTypeSchema,
});
