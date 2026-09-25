import { createNameSchema } from "#src/models/shared/Name";
import { pgTable } from "#src/pgTable";
import { resourceTypeEnum } from "#src/schema/resources";
import { users } from "#src/schema/users";
import { BOOKMARK_PATH_MAX_LENGTH, BOOKMARK_TITLE_MAX_LENGTH } from "#src/services/bookmark/constants";
import { createMaxLengthCheckSql } from "#src/services/shared/createMaxLengthCheckSql";
import { check, primaryKey, text } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";

// A page of the app the reader bookmarked to the dock: its path, the title it was bookmarked under, and the type of
// The resource it showed, which the dock draws as its mark — null for any page that is not a resource's. Server-side
// So bookmarks follow the reader between devices, unlike the recent pages, which stay on the device
export const bookmarks = pgTable(
  "bookmarks",
  {
    path: text().notNull(),
    resourceType: resourceTypeEnum(),
    title: text().notNull(),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ path, title, userId }) => [
      primaryKey({ columns: [userId, path] }),
      check("bookmarks_path_length_check", createMaxLengthCheckSql(path, BOOKMARK_PATH_MAX_LENGTH)),
      check("bookmarks_title_length_check", createMaxLengthCheckSql(title, BOOKMARK_TITLE_MAX_LENGTH)),
    ],
  },
);

export type Bookmark = typeof bookmarks.$inferSelect;

export const selectBookmarkSchema = createSelectSchema(bookmarks, {
  path: (schema) => schema.startsWith("/").max(BOOKMARK_PATH_MAX_LENGTH),
  title: (schema) => createNameSchema(BOOKMARK_TITLE_MAX_LENGTH, schema),
});
