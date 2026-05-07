import { createNameCheckSql, createNameSchema, createNormalizedStringSchema } from "@/models/shared/Name";
import { pgTable } from "@/pgTable";
import { messageSchema } from "@/schema/messageSchema";
import { roomsInMessage } from "@/schema/roomsInMessage";
import { sql } from "drizzle-orm";
import { bigint, boolean, check, index, integer, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";

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

export const ROOM_ROLE_COLOR_MAX_LENGTH = 9;
export const ROOM_ROLE_NAME_MAX_LENGTH = 100;

export const roomRolesInMessage = pgTable(
  "roomRoles",
  {
    color: text().notNull().default(""),
    id: uuid().primaryKey().defaultRandom(),
    isEveryone: boolean().notNull().default(false),
    name: text().notNull(),
    permissions: bigint({ mode: "bigint" }).notNull().default(0n),
    position: integer().notNull().default(0),
    roomId: uuid()
      .notNull()
      .references(() => roomsInMessage.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: (table) => [
      check(
        "room_roles_color_length_check",
        sql`LENGTH(${table.color}) <= ${sql.raw(ROOM_ROLE_COLOR_MAX_LENGTH.toString())}`,
      ),
      check("room_roles_name_length_check", createNameCheckSql(table.name, ROOM_ROLE_NAME_MAX_LENGTH)),
      check("room_roles_position_check", sql`${table.position} >= 0`),
      index("room_roles_roomId_position_index").on(table.roomId, table.position),
      uniqueIndex("room_roles_everyone_unique")
        .on(table.roomId)
        .where(sql`${table.isEveryone} = TRUE`),
    ],
    schema: messageSchema,
  },
);

export type RoomRoleInMessage = typeof roomRolesInMessage.$inferSelect;

export const selectRoomRoleInMessageSchema = createSelectSchema(roomRolesInMessage, {
  color: (schema) => createNormalizedStringSchema(ROOM_ROLE_COLOR_MAX_LENGTH, schema),
  name: (schema) => createNameSchema(ROOM_ROLE_NAME_MAX_LENGTH, schema),
  position: (schema) => schema.nonnegative(),
});
