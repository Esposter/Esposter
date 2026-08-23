import type { Resource } from "@esposter/db-schema";

import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { AZURE_MAX_PAGE_SIZE } from "@esposter/azure";
import { getPartitionKeyFilter, getTopNEntities } from "@esposter/db";
import { AzureTable, SurveyResponseEntity } from "@esposter/db-schema";

// The one capped read of a survey's responses. The dataset provider and the Responses blade's row-key
// Read both go through it, so the row keys the blade threads always line up with the rows it renders.
// Reading one entity past the cap answers "is there more?" for free — without it, a survey holding
// Exactly the cap would pay a full count scan just to learn it was never truncated
export const readSurveyResponseEntities = async (
  surveyId: Resource["id"],
): Promise<{ hasMore: boolean; surveyResponses: SurveyResponseEntity[] }> => {
  const surveyResponseClient = await useTableClient(AzureTable.SurveyResponses);
  const surveyResponses = await getTopNEntities(surveyResponseClient, AZURE_MAX_PAGE_SIZE + 1, SurveyResponseEntity, {
    filter: getPartitionKeyFilter(surveyId),
  });
  return {
    hasMore: surveyResponses.length > AZURE_MAX_PAGE_SIZE,
    surveyResponses: surveyResponses.slice(0, AZURE_MAX_PAGE_SIZE),
  };
};
