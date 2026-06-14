import { createNameCheckSql, createNameSchema } from "@/models/shared/Name";
import { pgTable } from "@/pgTable";
import { createNormalizedStringSchema } from "@esposter/shared";
import { sql } from "drizzle-orm";
import { boolean, check, text } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";

export const USER_BIOGRAPHY_MAX_LENGTH = 160;
export const USER_NAME_MAX_LENGTH = 100;

export const users = pgTable(
  "users",
  {
    biography: text().notNull().default(""),
    email: text().notNull().unique(),
    emailVerified: boolean().notNull(),
    id: text().primaryKey(),
    image: text().notNull().default(""),
    name: text().notNull(),
  },
  {
    extraConfig: ({ biography, name }) => [
      check(
        "users_biography_length_check",
        sql`LENGTH(${biography}) <= ${sql.raw(USER_BIOGRAPHY_MAX_LENGTH.toString())}`,
      ),
      check("users_name_length_check", createNameCheckSql(name, USER_NAME_MAX_LENGTH)),
    ],
  },
);

export type User = typeof users.$inferSelect;

export const selectUserSchema = createSelectSchema(users, {
  biography: (schema) => createNormalizedStringSchema(USER_BIOGRAPHY_MAX_LENGTH, schema),
  email: (schema) => schema.pipe(z.email()),
  name: (schema) => createNameSchema(USER_NAME_MAX_LENGTH, schema),
});
