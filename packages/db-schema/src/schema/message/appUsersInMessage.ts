import { messageSchema } from "#src/schema/message/messageSchema";
import { createTombstoneIndex } from "#src/services/tombstone/createTombstoneIndex";
import { sqliteTable } from "#src/sqliteTable";
import { text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-orm/zod";
import { v7 } from "uuid";
import { z } from "zod";

// The bot identity a webhook message is authored by.
// Its name is the webhook's, which is the one row that renames it.
// The identity holds only what it alone owns: the image it renders with
export const appUsersInMessage = sqliteTable(
  "appUsers",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => v7()),
    image: text().notNull().default(""),
  },
  { extraConfig: ({ deletedAt }) => [createTombstoneIndex("appUsers", deletedAt)], schema: messageSchema },
);

export type AppUserInMessage = typeof appUsersInMessage.$inferSelect;

export const selectAppUserInMessageSchema = createSelectSchema(appUsersInMessage, { id: () => z.uuidv7() });
