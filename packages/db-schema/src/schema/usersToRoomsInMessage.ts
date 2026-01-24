import type { RoomInMessage } from "@/schema/roomsInMessage";
import type { User } from "@/schema/users";

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

// @TODO: https://github.com/drizzle-team/drizzle-orm/issues/695
export const UserToRoomInMessageRelations = {
  room: true,
  user: true,
} as const;
export type UserToRoomInMessageWithRelations = UserToRoomInMessage & { room: RoomInMessage; user: User };
