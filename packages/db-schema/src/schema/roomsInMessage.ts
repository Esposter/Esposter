import { createNameCheckSql, createNameSchema, createNormalizedStringSchema } from "@/models/shared/Name";
import { pgTable } from "@/pgTable";
import { messageSchema } from "@/schema/messageSchema";
import { roomCategoriesInMessage } from "@/schema/roomCategoriesInMessage";
import { users } from "@/schema/users";
import { sql } from "drizzle-orm";
import { boolean, check, integer, pgEnum, text, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";

export const ROOM_NAME_MAX_LENGTH = 100;
export const ROOM_TOPIC_MAX_LENGTH = 500;

export enum RoomType {
  DirectMessage = "DirectMessage",
  Room = "Room",
}

export const roomTypeSchema = z.enum(RoomType) satisfies z.ZodType<RoomType>;

export const roomTypeEnum = pgEnum("room_type", RoomType);

export const roomsInMessage = pgTable(
  "rooms",
  {
    categoryId: uuid().references(() => roomCategoriesInMessage.id, { onDelete: "set null" }),
    id: uuid().primaryKey().defaultRandom(),
    image: text(),
    isReadOnly: boolean().notNull().default(false),
    name: text(),
    participantKey: text().unique(),
    slowmodeMs: integer(),
    topic: text().notNull().default(""),
    type: roomTypeEnum().notNull().default(RoomType.Room),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ name, participantKey, slowmodeMs, topic, type }) => [
      check(
        "rooms_name_check",
        sql`(${type} = '${sql.raw(RoomType.DirectMessage)}' AND ${name} IS NULL) OR (${type} = '${sql.raw(RoomType.Room)}' AND ${name} IS NOT NULL AND ${createNameCheckSql(name, ROOM_NAME_MAX_LENGTH)})`,
      ),
      check(
        "participant_key_type",
        sql`(${type} = '${sql.raw(RoomType.DirectMessage)}' AND ${participantKey} IS NOT NULL) OR (${type} = '${sql.raw(RoomType.Room)}' AND ${participantKey} IS NULL)`,
      ),
      check("rooms_slowmode_ms_check", sql`${slowmodeMs} IS NULL OR ${slowmodeMs} >= 1`),
      check("rooms_topic_length_check", sql`LENGTH(${topic}) <= ${sql.raw(ROOM_TOPIC_MAX_LENGTH.toString())}`),
    ],
    schema: messageSchema,
  },
);

export type RoomInMessage = typeof roomsInMessage.$inferSelect;

export const selectRoomInMessageSchema = createSelectSchema(roomsInMessage, {
  name: (schema) => createNameSchema(ROOM_NAME_MAX_LENGTH, schema),
  slowmodeMs: (schema) => schema.min(1),
  topic: (schema) => createNormalizedStringSchema(ROOM_TOPIC_MAX_LENGTH, schema),
});
