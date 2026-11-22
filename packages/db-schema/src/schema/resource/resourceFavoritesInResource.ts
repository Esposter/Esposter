import { resourceSchema } from "#src/schema/resource/resourceSchema";
import { createResourceUserColumns } from "#src/services/resource/createResourceUserColumns";
import { createTombstoneIndex } from "#src/services/tombstone/createTombstoneIndex";
import { sqliteTable } from "#src/sqliteTable";
import { primaryKey } from "drizzle-orm/sqlite-core";

// A row exists iff the user has starred the resource. Server-side rather than per-device — a star that
// Vanishes on another device reads as data loss, unlike recents which are tolerably per-device.
export const resourceFavoritesInResource = sqliteTable("resourceFavorites", createResourceUserColumns(), {
  extraConfig: ({ deletedAt, resourceId, userId }) => [
    primaryKey({ columns: [userId, resourceId] }),
    createTombstoneIndex("resourceFavorites", deletedAt),
  ],
  // Scoped by the user's id, so a star's write widens its RETURNING and its row version reaches the header under its key
  schema: resourceSchema,
  scope: { columns: ["userId"] },
});

export type ResourceFavoriteInResource = typeof resourceFavoritesInResource.$inferSelect;
