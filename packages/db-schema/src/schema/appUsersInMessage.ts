import { pgTable } from "@/pgTable";
import { messageSchema } from "@/schema/messageSchema";
import { sql } from "drizzle-orm";
import { check, text, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";

export const APP_USER_NAME_MAX_LENGTH = 100;

export const appUsersInMessage = pgTable(
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
    schema: messageSchema,
  },
);

export type AppUserInMessage = typeof appUsersInMessage.$inferSelect;

export const selectAppUserInMessageSchema = createSelectSchema(appUsersInMessage, {
  name: z.string().min(1).max(APP_USER_NAME_MAX_LENGTH),
});
