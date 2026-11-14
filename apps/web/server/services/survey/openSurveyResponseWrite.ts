import type { Context } from "#server/trpc/context";
import type { CreateSurveyResponseInput } from "#shared/models/db/survey/CreateSurveyResponseInput";

import { useStreamTableClient } from "#server/composables/streams/useStreamTableClient";
import { resolveSurveyResponseWrite } from "#server/services/survey/resolveSurveyResponseWrite";
import { StreamTable } from "@esposter/db-schema";

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
  surveyResponseClient: useStreamTableClient(StreamTable.SurveyResponses),
});
