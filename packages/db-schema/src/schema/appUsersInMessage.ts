import { createNameCheckSql, createNameSchema } from "@/models/shared/Name";
import { pgTable } from "@/pgTable";
import { messageSchema } from "@/schema/messageSchema";
import { check, text, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";

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
      check("app_users_name_length_check", createNameCheckSql(name, APP_USER_NAME_MAX_LENGTH)),
    ],
    schema: messageSchema,
  },
);

export type AppUserInMessage = typeof appUsersInMessage.$inferSelect;

export const selectAppUserInMessageSchema = createSelectSchema(appUsersInMessage, {
  name: createNameSchema(APP_USER_NAME_MAX_LENGTH),
});
