import { createNameCheckSql, createNameSchema } from "@/models/shared/Name";
import { pgTable } from "@/pgTable";
import { messageSchema } from "@/schema/messageSchema";
import { rooms } from "@/schema/rooms";
import { relations, sql } from "drizzle-orm";
import { bigint, boolean, check, index, integer, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

/* eslint-disable perfectionist/sort-objects */
export const RoomPermission = {
  // Text channel
  ReadMessages: 1n << 0n, // 1    — see message history / view channel
  SendMessages: 1n << 1n, // 2    — post messages
  ManageMessages: 1n << 2n, // 4    — delete/pin others' messages
  MentionEveryone: 1n << 3n, // 8    — use @here / @everyone
  // General
  ManageRoom: 1n << 4n, // 16   — edit room name, image, settings
  ManageRoles: 1n << 5n, // 32   — create/edit/delete roles below own top position
  ManageInvites: 1n << 6n, // 64   — create/delete invite codes
  // Moderation
  KickMembers: 1n << 7n, // 128  — remove a member from room
  BanMembers: 1n << 8n, // 256  — permanent ban
  MuteMembers: 1n << 9n, // 512  — force-mute/unmute in voice
  MoveMembers: 1n << 10n, // 1024 — kick from voice channel
  // Advanced
  ManageWebhooks: 1n << 11n, // 2048 — create/edit/delete webhooks
  Administrator: 1n << 12n, // 4096 — all permissions; bypasses hierarchy checks; always the highest bit
} as const;
/* eslint-enable perfectionist/sort-objects */

export type RoomPermission = (typeof RoomPermission)[keyof typeof RoomPermission];

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
      check("room_roles_name_length_check", createNameCheckSql(table.name, ROOM_ROLE_NAME_MAX_LENGTH)),
      check("room_roles_position_check", sql`${table.position} >= 0`),
      index("room_roles_room_id_position_index").on(table.roomId, table.position),
      uniqueIndex("room_roles_everyone_unique")
        .on(table.roomId)
        .where(sql`${table.isEveryone} = TRUE`),
    ],
    schema: messageSchema,
  },
);

export type RoomRole = typeof roomRoles.$inferSelect;

export const selectRoomRoleSchema = createSelectSchema(roomRoles, {
  name: createNameSchema(ROOM_ROLE_NAME_MAX_LENGTH),
  permissions: z.bigint(),
  position: z.number().int().nonnegative(),
});

export const roomRolesRelations = relations(roomRoles, ({ one }) => ({
  room: one(rooms, {
    fields: [roomRoles.roomId],
    references: [rooms.id],
  }),
}));
