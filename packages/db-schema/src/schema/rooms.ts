import { createNameCheckSql, createNameSchema } from "@/models/shared/Name";
import { pgTable } from "@/pgTable";
import { messageSchema } from "@/schema/messageSchema";
import { roomCategories } from "@/schema/roomCategories";
import { roomRoles } from "@/schema/roomRoles";
import { users } from "@/schema/users";
import { usersToRooms } from "@/schema/usersToRooms";
import { relations, sql } from "drizzle-orm";
import { check, pgEnum, text, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const ROOM_NAME_MAX_LENGTH = 100;

export enum RoomType {
  DirectMessage = "DirectMessage",
  Room = "Room",
}

export const roomTypeSchema = z.enum(RoomType) satisfies z.ZodType<RoomType>;

export const roomTypeEnum = pgEnum("room_type", RoomType);

export const rooms = pgTable(
  "rooms",
  {
    categoryId: uuid("categoryId").references(() => roomCategories.id, { onDelete: "set null" }),
    id: uuid("id").primaryKey().defaultRandom(),
    image: text("image"),
    name: text("name").notNull(),
    participantKey: text("participantKey").unique(),
    type: roomTypeEnum("type").notNull().default(RoomType.Room),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ name, participantKey, type }) => [
      check("name", createNameCheckSql(name, ROOM_NAME_MAX_LENGTH)),
      check(
        "participant_key_type",
        sql`(${type} = '${sql.raw(RoomType.DirectMessage)}' AND ${participantKey} IS NOT NULL) OR (${type} = '${sql.raw(RoomType.Room)}' AND ${participantKey} IS NULL)`,
      ),
    ],
    schema: messageSchema,
  },
);

export type Room = typeof rooms.$inferSelect;

export const selectRoomSchema = createSelectSchema(rooms, {
  name: createNameSchema(ROOM_NAME_MAX_LENGTH),
});

export const roomsRelations = relations(rooms, ({ many, one }) => ({
  category: one(roomCategories, {
    fields: [rooms.categoryId],
    references: [roomCategories.id],
  }),
  roomRoles: many(roomRoles),
  usersToRooms: many(usersToRooms),
}));
