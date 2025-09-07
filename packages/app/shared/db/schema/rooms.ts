import { pgTable } from "#shared/db/pgTable";
import { users } from "#shared/db/schema/users";
import { usersToRooms } from "#shared/db/schema/usersToRooms";
import { ROOM_NAME_MAX_LENGTH } from "#shared/services/message/constants";
import { relations, sql } from "drizzle-orm";
import { check, text, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const rooms = pgTable(
  "rooms",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    image: text("image"),
    name: text("name").notNull(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  ({ name }) => [
    check("name", sql`LENGTH(${name}) >= 1 AND LENGTH(${name}) <= ${sql.raw(ROOM_NAME_MAX_LENGTH.toString())}`),
  ],
);

export type Room = typeof rooms.$inferSelect;

export const selectRoomSchema = createSelectSchema(rooms, {
  name: z.string().max(ROOM_NAME_MAX_LENGTH),
});

export const roomsRelations = relations(rooms, ({ many }) => ({
  usersToRooms: many(usersToRooms),
}));
