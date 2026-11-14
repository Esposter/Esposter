import { resourceSchema } from "#src/schema/resource/resourceSchema";
import { createResourceUserColumns } from "#src/services/resource/createResourceUserColumns";
import { sqliteTable } from "#src/sqliteTable";
import { primaryKey } from "drizzle-orm/sqlite-core";

// A row exists iff the user has starred the resource. Server-side rather than per-device — a star that
// Vanishes on another device reads as data loss, unlike recents which are tolerably per-device.
export const resourceFavoritesInResource = sqliteTable("resourceFavorites", createResourceUserColumns(), {
  extraConfig: ({ resourceId, userId }) => [primaryKey({ columns: [userId, resourceId] })],
  schema: resourceSchema,
});

export type ResourceFavoriteInResource = typeof resourceFavoritesInResource.$inferSelect;
