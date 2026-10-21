import { pgTable } from "#src/pgTable";
import { resourceSchema } from "#src/schema/resource/resourceSchema";
import { resourceVersionsInResource, snapshotChannelEnum } from "#src/schema/resource/resourceVersionsInResource";
import { sql } from "drizzle-orm";
import { check, foreignKey, integer, primaryKey, text, uuid } from "drizzle-orm/pg-core";

// One row per asset a stored version's content embeds, keyed by the version and the asset's content hash. An asset
// Lives under its hash for as long as a row names it, so collection asks this table rather than reading content: a
// Version's rows are written from a scan of its plaintext when the version is stored, and cascade with the version
// Design: openspec/specs/resource/content-addressed-assets/design.md
export const resourceVersionAssetsInResource = pgTable(
  "resourceVersionAssets",
  {
    // The lowercase hex SHA-256 of the asset's bytes, which is the name the asset is stored under
    assetHash: text().notNull(),
    channel: snapshotChannelEnum().notNull(),
    resourceId: uuid().notNull(),
    version: integer().notNull(),
  },
  {
    extraConfig: ({ assetHash, channel, resourceId, version }) => [
      // Also the index every read takes: a version's rows are replaced under the resource lock, and collection reads
      // A resource's rows by its id, which is the leading column
      primaryKey({ columns: [resourceId, channel, version, assetHash] }),
      foreignKey({
        columns: [resourceId, channel, version],
        foreignColumns: [
          resourceVersionsInResource.resourceId,
          resourceVersionsInResource.channel,
          resourceVersionsInResource.version,
        ],
      }).onDelete("cascade"),
      check("resourceVersionAssets_assetHash_check", sql`${assetHash} ~ '^[0-9a-f]{64}$'`),
    ],
    schema: resourceSchema,
  },
);
