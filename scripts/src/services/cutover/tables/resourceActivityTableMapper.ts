import type { TableMapper } from "#src/models/cutover/TableMapper";

import { getReverseTickedMilliseconds } from "#src/services/cutover/tables/getReverseTickedMilliseconds";
import { resourceActivitiesInResource, ResourceActivityType, StreamTable } from "@esposter/db-schema";
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

// The ResourceActivity table: partitioned by resource and read newest-first by its reverse-ticked row key
export const resourceActivityTableMapper: TableMapper = {
  azureTable: StreamTable.ResourceActivity,
  countByPartitionSql: `SELECT "resourceId" AS "partitionKey", COUNT(*) AS "count" FROM "${getTableName(resourceActivitiesInResource)}" GROUP BY "resourceId"`,
  coreTable: getTableName(resourceActivitiesInResource),
  map: (entity, { idMap, parents, timestamp }) => {
    const activity = legacyResourceActivitySchema.parse(entity);
    if (!parents.resourceIds.has(activity.partitionKey)) return undefined;
    const createdAt = getReverseTickedMilliseconds(activity.rowKey);
    return {
      activityType: activity.activityType,
      apiKeyId: activity.apiKeyId && parents.apiKeyIds.has(activity.apiKeyId) ? activity.apiKeyId : null,
      apiKeyName: activity.apiKeyName ?? "",
      createdAt,
      deletedAt: null,
      id: idMap.assign(StreamTable.ResourceActivity, activity.partitionKey, activity.rowKey),
      newName: activity.newName ?? null,
      oldName: activity.oldName ?? null,
      publishVersion: activity.publishVersion ?? null,
      resourceId: activity.partitionKey,
      updatedAt: timestamp?.getTime() ?? createdAt,
      userId: activity.userId && parents.userIds.has(activity.userId) ? activity.userId : null,
    };
  },
};
