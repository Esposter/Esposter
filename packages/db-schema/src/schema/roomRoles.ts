import { pgTable } from "@/pgTable";
import { messageSchema } from "@/schema/messageSchema";
import { rooms } from "@/schema/rooms";
import { relations, sql } from "drizzle-orm";
import { bigint, boolean, check, index, integer, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const ROOM_ROLE_NAME_MAX_LENGTH = 100;

export const roomRoles = pgTable(
  "room_roles",
  {
    color: text("color"),
    id: uuid("id").primaryKey().defaultRandom(),
    isEveryone: boolean("isEveryone").notNull().default(false),
    name: text("name").notNull(),
    permissions: bigint("permissions", { mode: "bigint" }).notNull().default(0n),
    position: integer("position").notNull().default(0),
    roomId: uuid("roomId")
      .notNull()
      .references(() => rooms.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: (table) => [
      check("name", sql`LENGTH(${table.name}) <= ${sql.raw(ROOM_ROLE_NAME_MAX_LENGTH.toString())}`),
      check("position", sql`${table.position} >= 0`),
      index("room_roles_room_id_position_idx").on(table.roomId, table.position),
      uniqueIndex("room_roles_everyone_unique")
        .on(table.roomId)
        .where(sql`${table.isEveryone} = TRUE`),
    ],
    schema: messageSchema,
  },
);

export type RoomRole = typeof roomRoles.$inferSelect;

export const selectRoomRoleSchema = createSelectSchema(roomRoles, {
  name: z.string().max(ROOM_ROLE_NAME_MAX_LENGTH),
  permissions: z.bigint(),
  position: z.number().int().nonnegative(),
});

export const roomRolesRelations = relations(roomRoles, ({ one }) => ({
  room: one(rooms, {
    fields: [roomRoles.roomId],
    references: [rooms.id],
  }),
}));
