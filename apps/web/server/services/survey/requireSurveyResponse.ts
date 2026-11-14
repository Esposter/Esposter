import { requireEntity } from "#server/trpc/guards/requireEntity";
import { getEntity } from "@esposter/db";
import { AzureEntityType, SurveyResponseEntity } from "@esposter/db-schema";
import type { StreamTableClient } from "@esposter/db";

export const requireSurveyResponse = (
  surveyResponseClient: StreamTableClient<SurveyResponseEntity>,
  partitionKey: SurveyResponseEntity["partitionKey"],
  rowKey: SurveyResponseEntity["rowKey"],
): Promise<SurveyResponseEntity> =>
  requireEntity(
    getEntity(surveyResponseClient, SurveyResponseEntity, partitionKey, rowKey),
    AzureEntityType.SurveyResponse,
    JSON.stringify({ partitionKey, rowKey }),
  );
