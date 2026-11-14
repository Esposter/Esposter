import type { TableMapper } from "#src/models/cutover/TableMapper";

import { LegacyAzureTable } from "#src/models/cutover/LegacyAzureTable";
import { getReverseTickedMilliseconds } from "#src/services/cutover/tables/getReverseTickedMilliseconds";
import { resourceActivitiesInResource, ResourceActivityType } from "@esposter/db-schema";
import { getTableName } from "drizzle-orm";
import { z } from "zod";

// One entry in a resource's audit trail. An entry the app wrote without a member or an API key leaves that property empty
const legacyResourceActivitySchema = z.object({
  activityType: z.enum(ResourceActivityType),
  apiKeyId: z.string().optional(),
  apiKeyName: z.string().optional(),
  newName: z.string().optional(),
  oldName: z.string().optional(),
  partitionKey: z.string(),
  publishVersion: z.number().optional(),
  rowKey: z.string(),
  userId: z.string().optional(),
});

// The ResourceActivity table: partitioned by resource and read newest-first by its reverse-ticked row key. Every id it holds is a
// Postgres row's, so each is written with its new id
export const resourceActivityTableMapper: TableMapper = {
  azureTable: LegacyAzureTable.ResourceActivity,
  coreTable: getTableName(resourceActivitiesInResource),
  countByPartitionSql: `SELECT "resourceId" AS "partitionKey", COUNT(*) AS "count" FROM "${getTableName(resourceActivitiesInResource)}" GROUP BY "resourceId"`,
  toRow: (entity, { idMap, parents, timestamp }) => {
    const activity = legacyResourceActivitySchema.parse(entity);
    const resourceId = idMap.rewrite(activity.partitionKey);
    if (!parents.resourceIds.has(resourceId)) return undefined;

    const createdAt = getReverseTickedMilliseconds(activity.rowKey);
    const apiKeyId = activity.apiKeyId === undefined ? undefined : idMap.rewrite(activity.apiKeyId);
    const userId = activity.userId === undefined ? undefined : idMap.rewrite(activity.userId);
    return {
      activityType: activity.activityType,
      apiKeyId: apiKeyId && parents.apiKeyIds.has(apiKeyId) ? apiKeyId : null,
      apiKeyName: activity.apiKeyName ?? "",
      createdAt,
      deletedAt: null,
      id: idMap.assign(LegacyAzureTable.ResourceActivity, activity.partitionKey, activity.rowKey, new Date(createdAt))
        .id,
      newName: activity.newName ?? null,
      oldName: activity.oldName ?? null,
      publishVersion: activity.publishVersion ?? null,
      resourceId,
      updatedAt: timestamp?.getTime() ?? createdAt,
      userId: userId && parents.userIds.has(userId) ? userId : null,
    };
  },
};
