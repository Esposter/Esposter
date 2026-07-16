import type { Resource } from "@esposter/db-schema";

import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { getSurveyResponseFilter } from "@@/server/services/survey/getSurveyResponseFilter";
import { getTopNEntities } from "@esposter/db";
import { AZURE_MAX_PAGE_SIZE, AzureTable, SurveyResponseEntity } from "@esposter/db-schema";

// The one capped read of a survey's responses. The dataset provider and the Responses blade's row-key
// Read both go through it, so the row keys the blade threads always line up with the rows it renders
export const readSurveyResponseEntities = async (surveyId: Resource["id"]): Promise<SurveyResponseEntity[]> => {
  const surveyResponseClient = await useTableClient(AzureTable.SurveyResponses);
  return getTopNEntities(surveyResponseClient, AZURE_MAX_PAGE_SIZE, SurveyResponseEntity, {
    filter: getSurveyResponseFilter(surveyId),
  });
};
