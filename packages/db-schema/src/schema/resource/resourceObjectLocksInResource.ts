import { resourceSchema } from "#src/schema/resource/resourceSchema";
import { resourcesInResource } from "#src/schema/resource/resourcesInResource";
import { sqliteTable } from "#src/sqliteTable";
import { integer, text } from "drizzle-orm/sqlite-core";

// One lease per resource, held by the request that writes or collects its stored objects. D1 has no advisory lock, so the
// lease is a row: taken by an insert that replaces only an expired lease, and released by the delete that names its holder.
// A holder that never releases frees the resource when its lease expires, so a crashed request cannot hold it forever
// Design: openspec/specs/resource/resource-version-store/design.md
export const resourceObjectLocksInResource = sqliteTable(
  "resourceObjectLocks",
  {
    expiresAt: integer({ mode: "timestamp_ms" }).notNull(),
    holder: text().notNull(),
    resourceId: text()
      .primaryKey()
      .references(() => resourcesInResource.id, { onDelete: "cascade" }),
  },
  { schema: resourceSchema },
);
