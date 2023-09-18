import { users, usersToRooms } from "@/db/schema/users";
import { pgTable } from "@/db/shared/pgTable";
import { ROOM_NAME_MAX_LENGTH } from "@/services/esbabbler/constants";
import { relations } from "drizzle-orm";
import { text, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const rooms = pgTable("Room", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creatorId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  image: text("image"),
});

export type Room = typeof rooms.$inferSelect;

export const selectRoomSchema = createSelectSchema(rooms, {
  name: z.string().min(1).max(ROOM_NAME_MAX_LENGTH),
});

export const roomsRelations = relations(rooms, ({ many }) => ({
  usersToRooms: many(usersToRooms),
}));
