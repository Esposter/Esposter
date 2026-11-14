import type { Context } from "#server/trpc/context";

import { getResourcesWhere } from "#server/services/resource/getResourcesWhere";
import { resourcesInResource } from "@esposter/db-schema";
import { asc, count, desc, sql } from "drizzle-orm";

// The Tags list. Tag names live inside one JSON column rather than their own table, so the breakdown is a grouped count
// Over the expanded keys. The expansion is a subquery because a json_each table-valued function cannot sit beside an
// Aggregate in one select list. Values are deliberately not part of the grouping: the Tags entry answers "which tags do
// I use", and the /all Tag pill is where a value narrows it further
export const readResourceTagCounts = (db: Context["db"], userId: string) => {
  const tagNames = db
    .select({ name: sql<string>`json_each.key`.as("name") })
    .from(sql`${resourcesInResource}, json_each(${resourcesInResource.tags})`)
    .where(getResourcesWhere(db, userId, {}))
    .as("tag_names");
  return db
    .select({ count: count(), name: tagNames.name })
    .from(tagNames)
    .groupBy(tagNames.name)
    .orderBy(desc(count()), asc(tagNames.name));
};
