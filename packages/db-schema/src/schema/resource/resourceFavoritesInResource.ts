import { pgTable } from "#src/pgTable";
import { usersInAuth } from "#src/schema/auth/usersInAuth";
import { resourceSchema } from "#src/schema/resource/resourceSchema";
import { resourcesInResource } from "#src/schema/resource/resourcesInResource";
import { primaryKey, text, uuid } from "drizzle-orm/pg-core";

// A row exists iff the user has starred the resource. Server-side rather than per-device — a star that
// Vanishes on another device reads as data loss, unlike recents which are tolerably per-device.
export const resourceFavoritesInResource = pgTable(
  "resourceFavorites",
  {
    resourceId: uuid()
      .notNull()
      .references(() => resourcesInResource.id, { onDelete: "cascade" }),
    userId: text()
      .notNull()
      .references(() => usersInAuth.id, { onDelete: "cascade" }),
  },
  { extraConfig: ({ resourceId, userId }) => [primaryKey({ columns: [userId, resourceId] })], schema: resourceSchema },
);

export type ResourceFavoriteInResource = typeof resourceFavoritesInResource.$inferSelect;
