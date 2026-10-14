import type { Context } from "#server/trpc/context";
import type { SurveyResponseEntity } from "@esposter/db-schema";

import { useTableClient } from "#server/composables/azure/table/useTableClient";
import { resolveSurveyResponseWrite } from "#server/services/survey/resolveSurveyResponseWrite";
import { AzureTable } from "@esposter/db-schema";

// The identity a response write goes out under, and the table it lands in, for both response mutations
export const openSurveyResponseWrite = async (
  db: Context["db"],
  { partitionKey, participantToken }: Pick<SurveyResponseEntity, "participantToken" | "partitionKey">,
) => ({
  participantToken: await resolveSurveyResponseWrite(db, partitionKey, participantToken),
  surveyResponseClient: await useTableClient(AzureTable.SurveyResponses),
});
