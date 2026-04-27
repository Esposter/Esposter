import { createNameCheckSql, createNameSchema } from "@/models/shared/Name";
import { sql } from "drizzle-orm";
import { boolean, check, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";

export const USER_BIOGRAPHY_MAX_LENGTH = 160;
export const USER_NAME_MAX_LENGTH = 100;

export const users = pgTable(
  "users",
  {
    biography: text("biography"),
    createdAt: timestamp("created_at").notNull(),
    deletedAt: timestamp("deleted_at"),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").notNull(),
    id: text("id").primaryKey(),
    image: text("image"),
    name: text("name").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
  },
  ({ biography, name }) => [
    check(
      "users_biography_length_check",
      sql`${biography} IS NULL OR LENGTH(${biography}) <= ${sql.raw(USER_BIOGRAPHY_MAX_LENGTH.toString())}`,
    ),
    check("users_name_length_check", createNameCheckSql(name, USER_NAME_MAX_LENGTH)),
  ],
);

export type User = typeof users.$inferSelect;

export const selectUserSchema = createSelectSchema(users, {
  biography: z.string().max(USER_BIOGRAPHY_MAX_LENGTH).nullable(),
  email: z.email(),
  name: createNameSchema(USER_NAME_MAX_LENGTH),
});
