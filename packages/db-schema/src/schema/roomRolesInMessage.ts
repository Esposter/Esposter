import { createNameSchema } from "#src/models/shared/Name";
import { pgTable } from "#src/pgTable";
import { messageSchema } from "#src/schema/messageSchema";
import { roomsInMessage } from "#src/schema/roomsInMessage";
import { createMaxLengthCheckSql } from "#src/services/shared/createMaxLengthCheckSql";
import { createMinimumCheckSql } from "#src/services/shared/createMinimumCheckSql";
import { createNameCheckSql } from "#src/services/shared/createNameCheckSql";
import { createNormalizedStringSchema } from "@esposter/shared";
import { sql } from "drizzle-orm";
import { bigint, boolean, check, index, integer, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";

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
    extraConfig: ({ color, isEveryone, name, position, roomId }) => [
      check("roomRoles_color_length_check", createMaxLengthCheckSql(color, ROOM_ROLE_COLOR_MAX_LENGTH)),
      check("roomRoles_name_length_check", createNameCheckSql(name, ROOM_ROLE_NAME_MAX_LENGTH)),
      check("roomRoles_position_check", createMinimumCheckSql(position, 0)),
      index("roomRoles_roomId_position_index").on(roomId, position),
      uniqueIndex("roomRoles_roomId_isEveryone_unique")
        .on(roomId)
        .where(sql`${isEveryone} = TRUE`),
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
