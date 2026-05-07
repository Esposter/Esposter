import { createNameCheckSql, createNameSchema } from "@/models/shared/Name";
import { pgTable } from "@/pgTable";
import { messageSchema } from "@/schema/messageSchema";
import { users } from "@/schema/users";
import { sql } from "drizzle-orm";
import { check, integer, text, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";

export const ROOM_CATEGORY_NAME_MAX_LENGTH = 100;

export const roomCategoriesInMessage = pgTable(
  "roomCategories",
  {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    position: integer().notNull().default(0),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ name, position }) => [
      check("room_categories_name_length_check", createNameCheckSql(name, ROOM_CATEGORY_NAME_MAX_LENGTH)),
      check("room_categories_position_check", sql`${position} >= 0`),
    ],
    schema: messageSchema,
  },
);

export type RoomCategoryInMessage = typeof roomCategoriesInMessage.$inferSelect;

export const selectRoomCategoryInMessageSchema = createSelectSchema(roomCategoriesInMessage, {
  name: (schema) => createNameSchema(ROOM_CATEGORY_NAME_MAX_LENGTH, schema),
  position: (schema) => schema.nonnegative(),
});
