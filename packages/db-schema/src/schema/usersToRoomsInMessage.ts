import { messageSchema } from "@/schema/messageSchema";
import { roomsInMessage } from "@/schema/roomsInMessage";
import { users } from "@/schema/users";
import { pgEnum, primaryKey, text, uuid } from "drizzle-orm/pg-core";
import { z } from "zod";

export enum NotificationType {
  All = "All",
  DirectMessage = "DirectMessage",
  Never = "Never",
}

export const notificationTypeSchema = z.enum(NotificationType) satisfies z.ZodType<NotificationType>;

export const notificationTypeEnum = pgEnum("notification_type", NotificationType);

export const usersToRoomsInMessage = messageSchema.table(
  "users_to_rooms",
  {
    notificationType: notificationTypeEnum("notificationType").notNull().default(NotificationType.DirectMessage),
    roomId: uuid("roomId")
      .notNull()
      .references(() => roomsInMessage.id, { onDelete: "cascade" }),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  ({ roomId, userId }) => [primaryKey({ columns: [userId, roomId] })],
);
export type UserToRoomInMessage = typeof usersToRoomsInMessage.$inferSelect;
