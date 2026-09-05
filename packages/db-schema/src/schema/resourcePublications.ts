import { pgTable } from "#src/pgTable";
import { resources } from "#src/schema/resources";
import { integer, timestamp, uuid } from "drizzle-orm/pg-core";

// A row exists iff the resource is currently published — this is the Publishable capability's state.
// The version keys the immutable published blob snapshot ({id}/published/{publishVersion}).
export const resourcePublications = pgTable("resourcePublications", {
  publishedAt: timestamp().notNull().defaultNow(),
  // The working copy's contentVersion at the moment this publish was taken, which is what turns "has the draft
  // Moved since I published?" from a guess off two timestamps into a comparison. Zero on a row written before
  // The column existed, which compares as "the draft has moved" — the safe direction to be wrong in
  publishedContentVersion: integer().notNull().default(0),
  publishVersion: integer().notNull().default(1),
  resourceId: uuid()
    .primaryKey()
    .references(() => resources.id, { onDelete: "cascade" }),
});

export type ResourcePublication = typeof resourcePublications.$inferSelect;
