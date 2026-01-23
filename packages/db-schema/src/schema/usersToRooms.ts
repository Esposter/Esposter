import type { RoomInMessage } from "@/schema/roomsInMessage";
import type { User } from "@/schema/users";

import { messageSchema } from "@/schema/messageSchema";
import { roomsInMessage } from "@/schema/roomsInMessage";
import { users } from "@/schema/users";
import { relations } from "drizzle-orm";
import { pgEnum, primaryKey, text, uuid } from "drizzle-orm/pg-core";
import { z } from "zod";

export enum NotificationType {
  All = "All",
  DirectMessage = "DirectMessage",
  Never = "Never",
}

export const notificationTypeSchema = z.enum(NotificationType) satisfies z.ZodType<NotificationType>;

export const notificationTypeEnum = pgEnum("notification_type", NotificationType);

export const usersToRooms = messageSchema.table(
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
export type UserToRoom = typeof usersToRooms.$inferSelect;

export const usersToRoomsRelations = relations(usersToRooms, ({ one }) => ({
  room: one(roomsInMessage, {
    fields: [usersToRooms.roomId],
    references: [roomsInMessage.id],
  }),
  user: one(users, {
    fields: [usersToRooms.userId],
    references: [users.id],
  }),
}));
// @TODO: https://github.com/drizzle-team/drizzle-orm/issues/695
export const UserToRoomRelations = {
  room: true,
  user: true,
} as const;
export type UserToRoomWithRelations = UserToRoom & { room: RoomInMessage; user: User };
