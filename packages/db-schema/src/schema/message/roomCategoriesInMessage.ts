import { pgTable } from "#src/pgTable";
import { usersInAuth } from "#src/schema/auth/usersInAuth";
import { messageSchema } from "#src/schema/message/messageSchema";
import { ROOM_CATEGORY_NAME_MAX_LENGTH } from "#src/services/room/constants";
import { createMinimumCheckSql } from "#src/services/shared/createMinimumCheckSql";
import { createNameCheckSql } from "#src/services/shared/createNameCheckSql";
import { createNameSchema } from "#src/services/shared/createNameSchema";
import { check, index, integer, text, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";

export const roomCategoriesInMessage = pgTable(
  "roomCategories",
  {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    position: integer().notNull().default(0),
    userId: text()
      .notNull()
      .references(() => usersInAuth.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ name, position, userId }) => [
      check("roomCategories_name_length_check", createNameCheckSql(name, ROOM_CATEGORY_NAME_MAX_LENGTH)),
      check("roomCategories_position_check", createMinimumCheckSql(position, 0)),
      // A reader's categories are read by owner, and a user's deletion cascades through it
      index("roomCategories_userId_index").on(userId),
    ],
    schema: messageSchema,
  },
);

export type RoomCategoryInMessage = typeof roomCategoriesInMessage.$inferSelect;

export const selectRoomCategoryInMessageSchema = createSelectSchema(roomCategoriesInMessage, {
  id: () => z.uuidv4(),
  name: (schema) => createNameSchema(ROOM_CATEGORY_NAME_MAX_LENGTH, schema),
  position: (schema) => schema.nonnegative(),
});
