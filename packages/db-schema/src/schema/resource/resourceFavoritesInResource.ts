import { pgTable } from "#src/pgTable";
import { resourceSchema } from "#src/schema/resource/resourceSchema";
import { resourceUserColumns } from "#src/schema/resource/resourceUserColumns";
import { primaryKey } from "drizzle-orm/pg-core";

// A row exists iff the user has starred the resource. Server-side rather than per-device — a star that
// Vanishes on another device reads as data loss, unlike recents which are tolerably per-device.
export const resourceFavoritesInResource = pgTable(
  "resourceFavorites",
  { ...resourceUserColumns },
  { extraConfig: ({ resourceId, userId }) => [primaryKey({ columns: [userId, resourceId] })], schema: resourceSchema },
);

export type ResourceFavoriteInResource = typeof resourceFavoritesInResource.$inferSelect;
