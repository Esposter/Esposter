import { SnapshotChannel } from "#src/models/resource/SnapshotChannel";
import { SnapshotReason } from "#src/models/resource/SnapshotReason";
import { resourceSchema } from "#src/schema/resource/resourceSchema";
import { resourcesInResource } from "#src/schema/resource/resourcesInResource";
import { createEnumColumn } from "#src/services/shared/createEnumColumn";
import { createMinimumCheckSql } from "#src/services/shared/createMinimumCheckSql";
import { sqliteTable } from "#src/sqliteTable";
import { check, integer, primaryKey, text } from "drizzle-orm/sqlite-core";

// One retained version of a resource's content, keyed by the resource, the channel and the version number. The
// Bytes live in the content-addressed object the hash names; the row is what makes a version visible, so a
// Write that fails between the object and the row leaves no version, and an object no row names is adopted by
// The next write of the same content rather than swept. See openspec/specs/resource/resource-version-store/design.md
export const resourceVersionsInResource = sqliteTable(
  "resourceVersions",
  {
    // The keyframe the object decodes against, and empty when the version is itself a keyframe. Denormalised
    // Off the object's own header purely so collection is a query over both hash columns rather than a walk
    // Of every surviving object's header — an object survives while any row names it, as its own hash or as
    // Its base. The channel's current anchor is the newest row whose base is empty, never a column of its own
    baseHash: text().notNull().default(""),
    channel: createEnumColumn(SnapshotChannel).notNull(),
    hash: text().notNull(),
    // The size of the owner's document, which is what the history shows them
    plaintextBytes: integer().notNull(),
    // Absent on a published version, whose channel already says why it was taken
    reason: createEnumColumn(SnapshotReason),
    resourceId: text()
      .notNull()
      .references(() => resourcesInResource.id, { onDelete: "cascade" }),
    // The bytes the object cost to store, which is what the ledger charged — zero for a version whose content
    // The store already held. Never derivable from the plaintext size — conflating the two makes the storage
    // Meter say something an owner cannot account for
    storedBytes: integer().notNull(),
    summary: text().notNull().default(""),
    version: integer().notNull(),
  },
  {
    extraConfig: ({ channel, plaintextBytes, resourceId, storedBytes, version }) => [
      // Also the index every read takes: the listing walks a channel by version, the anchor read is the
      // Newest keyframe in one, and collection filters one resource's rows by hash
      primaryKey({ columns: [resourceId, channel, version] }),
      check("resourceVersions_plaintextBytes_check", createMinimumCheckSql(plaintextBytes, 0)),
      check("resourceVersions_storedBytes_check", createMinimumCheckSql(storedBytes, 0)),
    ],
    schema: resourceSchema,
  },
);

export type ResourceVersionInResource = typeof resourceVersionsInResource.$inferSelect;
