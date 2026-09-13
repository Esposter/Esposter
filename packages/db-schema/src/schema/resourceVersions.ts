import { SnapshotChannel } from "#src/models/resource/SnapshotChannel";
import { SnapshotReason } from "#src/models/resource/SnapshotReason";
import { pgTable } from "#src/pgTable";
import { resources } from "#src/schema/resources";
import { createMinimumCheckSql } from "#src/services/shared/createMinimumCheckSql";
import { bigint, check, integer, pgEnum, primaryKey, text, uuid } from "drizzle-orm/pg-core";

export const snapshotChannelEnum = pgEnum("snapshotChannel", SnapshotChannel);
export const snapshotReasonEnum = pgEnum("snapshotReason", SnapshotReason);
// One retained version of a resource's content, keyed by the resource, the channel and the version number —
// The three things a version's blob path used to spell out. The bytes live in the content-addressed object the
// Hash names; the row is what makes a version visible, so a write that fails between the object and the row
// Leaves no version, and an object no row names is adopted by the next write of the same content rather than
// Swept. See /docs/resource/resource-version-store
export const resourceVersions = pgTable(
  "resourceVersions",
  {
    // The keyframe the object decodes against, and empty when the version is itself a keyframe. Denormalised
    // Off the object's own header purely so collection is a query over both hash columns rather than a walk
    // Of every surviving object's header — an object survives while any row names it, as its own hash or as
    // Its base. The channel's current anchor is the newest row whose base is empty, never a column of its own
    baseHash: text().notNull().default(""),
    channel: snapshotChannelEnum().notNull(),
    hash: text().notNull(),
    // The size of the owner's document, which is what the history shows them
    plaintextBytes: bigint({ mode: "number" }).notNull(),
    // Absent on a published version, whose channel already says why it was taken
    reason: snapshotReasonEnum(),
    resourceId: uuid()
      .notNull()
      .references(() => resources.id, { onDelete: "cascade" }),
    // The bytes the object cost to store, which is what the ledger charged — zero for a version whose content
    // The store already held. Never derivable from the plaintext size, and conflating the two is how the
    // Storage meter came to say something an owner could not account for
    storedBytes: bigint({ mode: "number" }).notNull(),
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
  },
);

export type ResourceVersion = typeof resourceVersions.$inferSelect;
