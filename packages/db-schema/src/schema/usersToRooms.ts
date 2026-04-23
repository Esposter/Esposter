import type { Room } from "@/schema/rooms";
import type { User } from "@/schema/users";

import { pgTable } from "@/pgTable";
import { messageSchema } from "@/schema/messageSchema";
import { rooms } from "@/schema/rooms";
import { users } from "@/schema/users";
import { relations } from "drizzle-orm";
import { boolean, pgEnum, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { z } from "zod";

export enum NotificationType {
  All = "All",
  DirectMessage = "DirectMessage",
  Never = "Never",
}

export const notificationTypeSchema = z.enum(NotificationType) satisfies z.ZodType<NotificationType>;

export const notificationTypeEnum = pgEnum("notification_type", NotificationType);

export const usersToRooms = pgTable(
  "users_to_rooms",
  {
    isHidden: boolean("isHidden").notNull().default(false),
    notificationType: notificationTypeEnum("notificationType").notNull().default(NotificationType.DirectMessage),
    roomId: uuid("roomId")
      .notNull()
      .references(() => rooms.id, { onDelete: "cascade" }),
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
export type UserToRoom = typeof usersToRooms.$inferSelect;

export const usersToRoomsRelations = relations(usersToRooms, ({ one }) => ({
  room: one(rooms, {
    fields: [usersToRooms.roomId],
    references: [rooms.id],
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
export type UserToRoomWithRelations = UserToRoom & { room: Room; user: User };
