import { createMaxLengthCheckSql } from "#src/models/shared/Check";
import { createNameCheckSql, createNameSchema } from "#src/models/shared/Name";
import { pgTable } from "#src/pgTable";
import { messageSchema } from "#src/schema/messageSchema";
import { roomsInMessage } from "#src/schema/roomsInMessage";
import { createNormalizedStringSchema } from "@esposter/shared";
import { sql } from "drizzle-orm";
import { bigint, boolean, check, index, integer, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";
// Bit order is the wire format and is fixed by `packages/app/content/docs/esbabbler/rbac.md`; the sort is
// Disabled because that order, not the alphabet, is the contract. It runs category by category — text channel,
// General, moderation, advanced — and what each bit grants is said once, on the screen that grants it, by
// `packages/app/app/services/message/room/role/RoomPermissionDefinitionMap.ts`.
/* eslint-disable perfectionist/sort-objects */
export const RoomPermission = {
  ReadMessages: 1n << 0n,
  SendMessages: 1n << 1n,
  ManageMessages: 1n << 2n,
  MentionEveryone: 1n << 3n,
  ManageRoom: 1n << 4n,
  ManageRoles: 1n << 5n,
  ManageInvites: 1n << 6n,
  KickMembers: 1n << 7n,
  BanMembers: 1n << 8n,
  MuteMembers: 1n << 9n,
  MoveMembers: 1n << 10n,
  ManageNicknames: 1n << 11n,
  ManageWebhooks: 1n << 12n,
  ManageEmojis: 1n << 13n,
  // Last, and it moves up as the list grows: stored values are read as the current shape rather than migrated,
  // So the bits are free to be the order the list should be in rather than the order it was written in.
  // `permissions` is a signed 64-bit bigint, so bit 62 is the ceiling this can grow to
  Administrator: 1n << 14n,
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
      check("roomRoles_color_length_check", createMaxLengthCheckSql(table.color, ROOM_ROLE_COLOR_MAX_LENGTH)),
      check("roomRoles_name_length_check", createNameCheckSql(table.name, ROOM_ROLE_NAME_MAX_LENGTH)),
      check("roomRoles_position_check", sql`${table.position} >= 0`),
      index("roomRoles_roomId_position_index").on(table.roomId, table.position),
      uniqueIndex("roomRoles_roomId_isEveryone_unique")
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
