import type { TableMapper } from "#src/models/cutover/TableMapper";

import { LegacyAzureTable } from "#src/models/cutover/LegacyAzureTable";
import { resourceViewsInResource } from "@esposter/db-schema";
import { getTableName } from "drizzle-orm";
import { z } from "zod";

// A resource's view count for one UTC day, the day being the row key
const legacyResourceViewSchema = z.object({ count: z.number(), partitionKey: z.string(), rowKey: z.string() });

// The ResourceViews table: one row per resource per UTC day, so the unique key over (resource, day) holds one id per bucket
export const resourceViewTableMapper: TableMapper = {
  azureTable: LegacyAzureTable.ResourceViews,
  coreTable: getTableName(resourceViewsInResource),
  countByPartitionSql: `SELECT "resourceId" AS "partitionKey", COUNT(*) AS "count" FROM "${getTableName(resourceViewsInResource)}" GROUP BY "resourceId"`,
  toRow: (entity, { idMap, parents, timestamp }) => {
    const view = legacyResourceViewSchema.parse(entity);
    const resourceId = idMap.rewrite(view.partitionKey);
    if (!parents.resourceIds.has(resourceId)) return undefined;

    const createdAt = timestamp?.getTime() ?? Date.now();
    return {
      count: view.count,
      createdAt,
      deletedAt: null,
      id: idMap.assign(LegacyAzureTable.ResourceViews, view.partitionKey, view.rowKey, new Date(createdAt)).id,
      resourceId,
      updatedAt: createdAt,
      utcDate: view.rowKey,
    };
  },
};
