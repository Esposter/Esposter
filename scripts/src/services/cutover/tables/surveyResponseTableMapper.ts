import type { TableMapper } from "#src/models/cutover/TableMapper";

import { StreamTable, surveyResponsesInResource } from "@esposter/db-schema";
import { getTableName } from "drizzle-orm";
import { z } from "zod";

// One answer to a survey, keyed by a random row key, so its time is the write's own timestamp
const legacySurveyResponseSchema = z.object({
  isDraft: z.boolean().optional(),
  model: z.record(z.string(), z.unknown()).optional(),
  modelVersion: z.number(),
  pageNo: z.number(),
  partitionKey: z.string(),
  participantToken: z.string(),
  rowKey: z.string(),
});

// The SurveyResponses table: partitioned by the survey's resource, the answer kept whole as its JSON model
export const surveyResponseTableMapper: TableMapper = {
  azureTable: StreamTable.SurveyResponses,
  countByPartitionSql: `SELECT "resourceId" AS "partitionKey", COUNT(*) AS "count" FROM "${getTableName(surveyResponsesInResource)}" GROUP BY "resourceId"`,
  coreTable: getTableName(surveyResponsesInResource),
  map: (entity, { idMap, parents, timestamp }) => {
    const response = legacySurveyResponseSchema.parse(entity);
    if (!parents.resourceIds.has(response.partitionKey)) return undefined;
    const createdAt = timestamp?.getTime() ?? Date.now();
    return {
      createdAt,
      deletedAt: null,
      id: idMap.assign(StreamTable.SurveyResponses, response.partitionKey, response.rowKey),
      isDraft: response.isDraft ? 1 : 0,
      model: JSON.stringify(response.model ?? {}),
      modelVersion: response.modelVersion,
      pageNo: response.pageNo,
      participantToken: response.participantToken,
      resourceId: response.partitionKey,
      updatedAt: createdAt,
    };
  },
};
