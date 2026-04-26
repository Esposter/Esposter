import { pgTable } from "@/pgTable";
import { messageSchema } from "@/schema/messageSchema";
import { roomsInMessage } from "@/schema/roomsInMessage";
import { users } from "@/schema/users";
import { boolean, pgEnum, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
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
    extraConfig: ({ roomId, userId }) => [primaryKey({ columns: [userId, roomId] })],
    schema: messageSchema,
  },
);

export type UserToRoomInMessage = typeof usersToRoomsInMessage.$inferSelect;
