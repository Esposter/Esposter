import { pgTable } from "@/pgTable";
import { messageSchema } from "@/schema/messageSchema";
import { webhooks } from "@/schema/webhooks";
import { createNameSchema } from "@/services/zod";
import { relations, sql } from "drizzle-orm";
import { check, text, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";

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
      check("name", sql`LENGTH(${name}) BETWEEN 1 AND ${sql.raw(APP_USER_NAME_MAX_LENGTH.toString())}`),
    ],
    schema: messageSchema,
  },
);

export type AppUser = typeof appUsers.$inferSelect;

export const selectAppUserSchema = createSelectSchema(appUsers, {
  name: createNameSchema(APP_USER_NAME_MAX_LENGTH),
});

export const appUsersRelations = relations(appUsers, ({ one }) => ({
  webhooks: one(webhooks, {
    fields: [appUsers.id],
    references: [webhooks.userId],
  }),
}));
