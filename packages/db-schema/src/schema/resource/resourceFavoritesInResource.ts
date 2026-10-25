import { pgTable } from "#src/pgTable";
import { resourceSchema } from "#src/schema/resource/resourceSchema";
import { createResourceUserColumns } from "#src/services/resource/createResourceUserColumns";
import { primaryKey } from "drizzle-orm/pg-core";

// A row exists iff the user has starred the resource. Server-side rather than per-device — a star that
// Vanishes on another device reads as data loss, unlike recents which are tolerably per-device.
export const resourceFavoritesInResource = pgTable("resourceFavorites", createResourceUserColumns(), {
  extraConfig: ({ resourceId, userId }) => [primaryKey({ columns: [userId, resourceId] })],
  schema: resourceSchema,
});

export type ResourceFavoriteInResource = typeof resourceFavoritesInResource.$inferSelect;
