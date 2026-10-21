import { pgTable } from "#src/pgTable";
import { resourceSchema } from "#src/schema/resource/resourceSchema";
import { resourcesInResource } from "#src/schema/resource/resourcesInResource";
import { sql } from "drizzle-orm";
import { check, primaryKey, text, uuid } from "drizzle-orm/pg-core";

// One row per asset the resource's current working copy embeds, keyed by the resource and the asset's content hash. Rows
// Are replaced by each content save and removed with their resource by cascade
// Design: openspec/specs/resource/content-addressed-assets/design.md
export const resourceWorkingAssetsInResource = pgTable(
  "resourceWorkingAssets",
  {
    // The lowercase hex SHA-256 of the asset's bytes, which is the name the asset is stored under
    assetHash: text().notNull(),
    resourceId: uuid()
      .notNull()
      .references(() => resourcesInResource.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ assetHash, resourceId }) => [
      primaryKey({ columns: [resourceId, assetHash] }),
      check("resourceWorkingAssets_assetHash_check", sql`${assetHash} ~ '^[0-9a-f]{64}$'`),
    ],
    schema: resourceSchema,
  },
);
