import { messageSchema } from "#src/schema/message/messageSchema";
import { APP_USER_NAME_MAX_LENGTH } from "#src/services/message/webhook/constants";
import { createNameCheckSql } from "#src/services/shared/createNameCheckSql";
import { createNameSchema } from "#src/services/shared/createNameSchema";
import { sqliteTable } from "#src/sqliteTable";
import { check, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-orm/zod";
import { v7 } from "uuid";
import { z } from "zod";

export const appUsersInMessage = sqliteTable(
  "appUsers",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => v7()),
    image: text().notNull().default(""),
    name: text().notNull(),
  },
  {
    extraConfig: ({ name }) => [
      check("appUsers_name_length_check", createNameCheckSql(name, APP_USER_NAME_MAX_LENGTH)),
    ],
    schema: messageSchema,
  },
);

export type AppUserInMessage = typeof appUsersInMessage.$inferSelect;

export const selectAppUserInMessageSchema = createSelectSchema(appUsersInMessage, {
  id: () => z.uuidv7(),
  name: (schema) => createNameSchema(APP_USER_NAME_MAX_LENGTH, schema),
});
