import { pgTable } from "@/pgTable";
import { messageSchema } from "@/schema/messageSchema";
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
    id: uuid("id").primaryKey().defaultRandom(),
    image: text("image"),
    name: text("name").notNull(),
    // Canonical sorted participant fingerprint — set only for DirectMessage rooms.
    // Computed as userIds.toSorted().join(ID_SEPARATOR) before insert.
    // Unique index enforces one DM room per participant set at the DB level.
    participantKey: text("participantKey").unique(),
    type: roomTypeEnum("type").notNull().default(RoomType.Room),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ name }) => [check("name", sql`LENGTH(${name}) <= ${sql.raw(ROOM_NAME_MAX_LENGTH.toString())}`)],
    schema: messageSchema,
  },
);

export type Room = typeof rooms.$inferSelect;

export const selectRoomSchema = createSelectSchema(rooms, {
  name: z.string().max(ROOM_NAME_MAX_LENGTH),
});

export const roomsRelations = relations(rooms, ({ many }) => ({
  usersToRooms: many(usersToRooms),
}));
