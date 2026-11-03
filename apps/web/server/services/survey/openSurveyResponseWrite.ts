import type { Context } from "#server/trpc/context";
import type { CreateSurveyResponseInput } from "#shared/models/db/survey/CreateSurveyResponseInput";

import { useTableClient } from "#server/composables/azure/table/useTableClient";
import { resolveSurveyResponseWrite } from "#server/services/survey/resolveSurveyResponseWrite";
import { AzureTable } from "@esposter/db-schema";

// The identity a response write goes out under, and the table it lands in, for both response mutations
export const openSurveyResponseWrite = async (
  db: Context["db"],
  {
    isDraft,
    model,
    participantToken,
    partitionKey,
  }: Pick<CreateSurveyResponseInput, "isDraft" | "model" | "participantToken" | "partitionKey">,
) => ({
  participantToken: await resolveSurveyResponseWrite(db, partitionKey, participantToken, { isDraft, model }),
  surveyResponseClient: await useTableClient(AzureTable.SurveyResponses),
});
