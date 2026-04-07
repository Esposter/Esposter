import { pgTable } from "@/pgTable";
import { messageSchema } from "@/schema/messageSchema";
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
      check("name", sql`LENGTH(${name}) <= ${sql.raw(ROOM_NAME_MAX_LENGTH.toString())}`),
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
  name: z.string().max(ROOM_NAME_MAX_LENGTH),
});
