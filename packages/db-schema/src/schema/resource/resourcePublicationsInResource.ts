import { resourceSchema } from "#src/schema/resource/resourceSchema";
import { resourcesInResource } from "#src/schema/resource/resourcesInResource";
import { sqliteTable } from "#src/sqliteTable";
import { integer, text } from "drizzle-orm/sqlite-core";

// A row exists iff the resource is currently published — this is the Publishable capability's state.
// The version names the published channel's live `resourceVersions` row.
// Design: openspec/specs/resource/resource-version-store/design.md
export const resourcePublicationsInResource = sqliteTable(
  "resourcePublications",
  {
    publishedAt: integer({ mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    // The working copy's contentVersion at the moment this publish was taken, which is what turns "has the draft
    // Moved since I published?" from a guess off two timestamps into a comparison. Zero on a row written before
    // The column existed, which compares as "the draft has moved" — the safe direction to be wrong in
    publishedContentVersion: integer().notNull().default(0),
    publishVersion: integer().notNull().default(1),
    resourceId: text()
      .primaryKey()
      .references(() => resourcesInResource.id, { onDelete: "cascade" }),
  },
  { schema: resourceSchema },
);

export type ResourcePublicationInResource = typeof resourcePublicationsInResource.$inferSelect;
