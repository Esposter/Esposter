import { createNameCheckSql, createNameSchema } from "@/models/shared/Name";
import { pgTable } from "@/pgTable";
import { messageSchema } from "@/schema/messageSchema";
import { roomCategoriesInMessage } from "@/schema/roomCategoriesInMessage";
import { users } from "@/schema/users";
import { sql } from "drizzle-orm";
import { check, pgEnum, text, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";

export const ROOM_NAME_MAX_LENGTH = 100;

export enum RoomType {
  DirectMessage = "DirectMessage",
  Room = "Room",
}

export const roomTypeSchema = z.enum(RoomType) satisfies z.ZodType<RoomType>;

export const roomTypeEnum = pgEnum("room_type", RoomType);

export const roomsInMessage = pgTable(
  "rooms",
  {
    categoryId: uuid("categoryId").references(() => roomCategoriesInMessage.id, { onDelete: "set null" }),
    id: uuid("id").primaryKey().defaultRandom(),
    image: text("image"),
    name: text("name"),
    participantKey: text("participantKey").unique(),
    type: roomTypeEnum("type").notNull().default(RoomType.Room),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ name, participantKey, type }) => [
      check(
        "rooms_name_check",
        sql`(${type} = '${sql.raw(RoomType.DirectMessage)}' AND ${name} IS NULL) OR (${type} = '${sql.raw(RoomType.Room)}' AND ${name} IS NOT NULL AND ${createNameCheckSql(name, ROOM_NAME_MAX_LENGTH)})`,
      ),
      check(
        "participant_key_type",
        sql`(${type} = '${sql.raw(RoomType.DirectMessage)}' AND ${participantKey} IS NOT NULL) OR (${type} = '${sql.raw(RoomType.Room)}' AND ${participantKey} IS NULL)`,
      ),
    ],
    schema: messageSchema,
  },
);

export type RoomInMessage = typeof roomsInMessage.$inferSelect;

export const selectRoomInMessageSchema = createSelectSchema(roomsInMessage, {
  name: createNameSchema(ROOM_NAME_MAX_LENGTH).nullable(),
});
