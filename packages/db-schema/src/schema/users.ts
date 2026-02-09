import { sql } from "drizzle-orm";
import { boolean, check, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";

export const USER_NAME_MAX_LENGTH = 100;

export const users = pgTable(
  "users",
  {
    createdAt: timestamp("created_at").notNull(),
    deletedAt: timestamp("deleted_at"),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").notNull(),
    id: text("id").primaryKey(),
    image: text("image"),
    name: text("name").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
  },
  ({ name }) => [
    check("name", sql`LENGTH(${name}) >= 1 AND LENGTH(${name}) <= ${sql.raw(USER_NAME_MAX_LENGTH.toString())}`),
  ],
);

export type User = typeof users.$inferSelect;

export const selectUserSchema = createSelectSchema(users, {
  email: z.email(),
  name: z.string().min(1).max(USER_NAME_MAX_LENGTH),
});
