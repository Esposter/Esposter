import { appSchema } from "#src/schema/app/appSchema";
import { usersInAuth } from "#src/schema/auth/usersInAuth";
import { roomsInMessage } from "#src/schema/message/roomsInMessage";
import { resourcesInResource } from "#src/schema/resource/resourcesInResource";
import { BOOKMARK_PATH_MAX_LENGTH, BOOKMARK_TITLE_MAX_LENGTH } from "#src/services/bookmark/constants";
import { createMaxLengthCheckSql } from "#src/services/shared/createMaxLengthCheckSql";
import { createNameSchema } from "#src/services/shared/createNameSchema";
import { sqliteTable } from "#src/sqliteTable";
import { sql } from "drizzle-orm";
import { check, index, primaryKey, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-orm/zod";

// A page of the app the reader bookmarked to the dock: its path, the title it was bookmarked under, and the resource
// Or room it shows. A page with neither, such as a product's, has no target. Server-side so bookmarks follow the reader
// Between devices, unlike the recent pages, which stay on the device. A target's delete takes its bookmarks with it
export const bookmarksInApp = sqliteTable(
  "bookmarks",
  {
    path: text().notNull(),
    resourceId: text().references(() => resourcesInResource.id, { onDelete: "cascade" }),
    roomId: text().references(() => roomsInMessage.id, { onDelete: "cascade" }),
    title: text().notNull(),
    userId: text()
      .notNull()
      .references(() => usersInAuth.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ path, resourceId, roomId, title, userId }) => [
      primaryKey({ columns: [userId, path] }),
      check("bookmarks_path_length_check", createMaxLengthCheckSql(path, BOOKMARK_PATH_MAX_LENGTH)),
      check("bookmarks_title_length_check", createMaxLengthCheckSql(title, BOOKMARK_TITLE_MAX_LENGTH)),
      // A page shows one target at most, so a row names one or none
      check("bookmarks_resourceId_roomId_check", sql`${resourceId} IS NULL OR ${roomId} IS NULL`),
      // Only a bookmark with a target is ever looked up by it, so each index holds just those rows
      index("bookmarks_resourceId_index")
        .on(resourceId)
        .where(sql`${resourceId} IS NOT NULL`),
      index("bookmarks_roomId_index")
        .on(roomId)
        .where(sql`${roomId} IS NOT NULL`),
    ],
    schema: appSchema,
  },
);

export type BookmarkInApp = typeof bookmarksInApp.$inferSelect;

export const selectBookmarkInAppSchema = createSelectSchema(bookmarksInApp, {
  path: (schema) => schema.startsWith("/").max(BOOKMARK_PATH_MAX_LENGTH),
  title: (schema) => createNameSchema(BOOKMARK_TITLE_MAX_LENGTH, schema),
});
