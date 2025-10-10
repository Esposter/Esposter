import { pgTable } from "@/pgTable";
import { webhooks } from "@/schema/webhooks";
import { relations, sql } from "drizzle-orm";
import { check, text, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const APP_USER_NAME_MAX_LENGTH = 100;

export const appUsers = pgTable(
  "app_users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    image: text("image"),
    name: text("name").notNull(),
  },
  {
    extraConfig: ({ name }) => [
      check("name", sql`LENGTH(${name}) >= 1 AND LENGTH(${name}) <= ${sql.raw(APP_USER_NAME_MAX_LENGTH.toString())}`),
    ],
  },
);

export type User = typeof appUsers.$inferSelect;

export const selectUserSchema = createSelectSchema(appUsers, {
  name: z.string().min(1).max(APP_USER_NAME_MAX_LENGTH),
});

export const usersRelations = relations(appUsers, ({ one }) => ({
  webhooks: one(webhooks, {
    fields: [appUsers.id],
    references: [webhooks.userId],
  }),
}));
