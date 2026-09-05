import { pgTable } from "#src/pgTable";
import { resources } from "#src/schema/resources";
import { users } from "#src/schema/users";
import { primaryKey, text, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";

// A row exists iff the user has starred the resource. Server-side rather than per-device — a star that
// Vanishes on another device reads as data loss, unlike recents which are tolerably per-device.
export const resourceFavorites = pgTable(
  "resourceFavorites",
  {
    resourceId: uuid()
      .notNull()
      .references(() => resources.id, { onDelete: "cascade" }),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  { extraConfig: ({ resourceId, userId }) => [primaryKey({ columns: [userId, resourceId] })] },
);

export type ResourceFavorite = typeof resourceFavorites.$inferSelect;

export const selectResourceFavoriteSchema = createSelectSchema(resourceFavorites);
