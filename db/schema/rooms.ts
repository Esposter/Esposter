import { users } from "@/db/schema/users";
import { pgTable } from "@/db/shared/pgTable";
import { relations } from "drizzle-orm";
import { text, uuid } from "drizzle-orm/pg-core";

export const rooms = pgTable("Room", {
  id: uuid("id").primaryKey(),
  creatorId: text("creatorId").references(() => users.id),
  name: text("name").notNull(),
  image: text("image"),
});

export const roomsRelations = relations(rooms, ({ many }) => ({
  users: many(users),
}));
