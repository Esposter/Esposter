import type { TableMapper } from "#src/models/cutover/TableMapper";

import { resourceViewsInResource, StreamTable } from "@esposter/db-schema";
import { getTableName } from "drizzle-orm";
import { z } from "zod";

// A resource's view count for one UTC day, the day being the row key
const legacyResourceViewSchema = z.object({
  count: z.number(),
  partitionKey: z.string(),
  rowKey: z.string(),
});

// The ResourceViews table: one row per resource per UTC day, so the unique key over (resource, day) holds one id per bucket
export const resourceViewTableMapper: TableMapper = {
  azureTable: StreamTable.ResourceViews,
  countByPartitionSql: `SELECT "resourceId" AS "partitionKey", COUNT(*) AS "count" FROM "${getTableName(resourceViewsInResource)}" GROUP BY "resourceId"`,
  coreTable: getTableName(resourceViewsInResource),
  map: (entity, { idMap, parents, timestamp }) => {
    const view = legacyResourceViewSchema.parse(entity);
    if (!parents.resourceIds.has(view.partitionKey)) return undefined;
    const createdAt = timestamp?.getTime() ?? Date.now();
    return {
      count: view.count,
      createdAt,
      deletedAt: null,
      id: idMap.assign(StreamTable.ResourceViews, view.partitionKey, view.rowKey),
      resourceId: view.partitionKey,
      updatedAt: createdAt,
      utcDate: view.rowKey,
    };
  },
};
