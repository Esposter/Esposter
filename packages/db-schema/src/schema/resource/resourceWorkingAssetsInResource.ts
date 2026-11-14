import { resourceSchema } from "#src/schema/resource/resourceSchema";
import { resourcesInResource } from "#src/schema/resource/resourcesInResource";
import { createAssetHashCheckSql } from "#src/services/resource/createAssetHashCheckSql";
import { sqliteTable } from "#src/sqliteTable";
import { check, primaryKey, text } from "drizzle-orm/sqlite-core";

// One row per asset the resource's current working copy embeds, keyed by the resource and the asset's content hash. Rows
// Are replaced by each content save and removed with their resource by cascade
// Design: openspec/specs/resource/content-addressed-assets/design.md
export const resourceWorkingAssetsInResource = sqliteTable(
  "resourceWorkingAssets",
  {
    // The lowercase hex SHA-256 of the asset's bytes, which is the name the asset is stored under
    assetHash: text().notNull(),
    resourceId: text()
      .notNull()
      .references(() => resourcesInResource.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ assetHash, resourceId }) => [
      primaryKey({ columns: [resourceId, assetHash] }),
      check("resourceWorkingAssets_assetHash_check", createAssetHashCheckSql(assetHash)),
    ],
    schema: resourceSchema,
  },
);
