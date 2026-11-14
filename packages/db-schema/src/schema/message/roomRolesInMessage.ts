import { messageSchema } from "#src/schema/message/messageSchema";
import { roomsInMessage } from "#src/schema/message/roomsInMessage";
import { ROOM_ROLE_COLOR_MAX_LENGTH, ROOM_ROLE_NAME_MAX_LENGTH } from "#src/services/room/constants";
import { createBigintColumn } from "#src/services/shared/createBigintColumn";
import { createMaxLengthCheckSql } from "#src/services/shared/createMaxLengthCheckSql";
import { createMinimumCheckSql } from "#src/services/shared/createMinimumCheckSql";
import { createNameCheckSql } from "#src/services/shared/createNameCheckSql";
import { createNameSchema } from "#src/services/shared/createNameSchema";
import { sqliteTable } from "#src/sqliteTable";
import { createNormalizedStringSchema } from "@esposter/shared";
import { sql } from "drizzle-orm";
import { check, index, integer, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";

export const roomRolesInMessage = sqliteTable(
  "roomRoles",
  {
    color: text().notNull().default(""),
    id: text()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    isEveryone: integer({ mode: "boolean" }).notNull().default(false),
    name: text().notNull(),
    permissions: createBigintColumn().notNull().default(0n),
    position: integer().notNull().default(0),
    roomId: text()
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
  id: () => z.uuidv4(),
  name: (schema) => createNameSchema(ROOM_ROLE_NAME_MAX_LENGTH, schema),
  // A custom column has no zod type of its own, so the bigint it reads back as is named here
  permissions: () => z.bigint(),
  position: (schema) => schema.nonnegative(),
  roomId: () => z.uuidv4(),
});
