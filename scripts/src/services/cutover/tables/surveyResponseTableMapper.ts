import type { TableMapper } from "#src/models/cutover/TableMapper";

import { requireReissuedTokenHash } from "#src/services/cutover/ids/requireReissuedTokenHash";
import { surveyResponsesInResource } from "@esposter/db-schema";
import { LegacyAzureTable } from "#src/models/cutover/LegacyAzureTable";
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

// The SurveyResponses table: partitioned by the survey's resource, the answer kept whole as its JSON model. It names its participant by
// the participant's token, which is written as the hash the participant's row was given; an answer whose participant is gone is left out
export const surveyResponseTableMapper: TableMapper = {
  azureTable: LegacyAzureTable.SurveyResponses,
  countByPartitionSql: `SELECT "resourceId" AS "partitionKey", COUNT(*) AS "count" FROM "${getTableName(surveyResponsesInResource)}" GROUP BY "resourceId"`,
  coreTable: getTableName(surveyResponsesInResource),
  map: (entity, { idMap, parents, timestamp }) => {
    const response = legacySurveyResponseSchema.parse(entity);
    const resourceId = idMap.rewrite(response.partitionKey);
    if (!parents.resourceIds.has(resourceId) || idMap.reissuedTokenHashOf(response.participantToken) === undefined)
      return undefined;

    const createdAt = timestamp?.getTime() ?? Date.now();
    return {
      createdAt,
      deletedAt: null,
      id: idMap.assign(LegacyAzureTable.SurveyResponses, response.partitionKey, response.rowKey, new Date(createdAt))
        .id,
      isDraft: response.isDraft ? 1 : 0,
      model: JSON.stringify(response.model ?? {}),
      modelVersion: response.modelVersion,
      pageNo: response.pageNo,
      participantTokenHash: requireReissuedTokenHash(
        idMap,
        response.participantToken,
        getTableName(surveyResponsesInResource),
      ),
      resourceId,
      updatedAt: createdAt,
    };
  },
};
