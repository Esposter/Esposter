import type { CountSurveyResponsesOutput } from "#shared/models/resource/survey/CountSurveyResponsesOutput";
import type { Resource } from "@esposter/db-schema";

import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { getSurveyResponseFilter } from "@@/server/services/survey/getSurveyResponseFilter";
import { countEntities } from "@esposter/db";
import { AZURE_MAX_PAGE_SIZE, AzureTable } from "@esposter/db-schema";

// Counts keys-only rows up to one past the cap — that extra key is what distinguishes exactly-cap
// From beyond-cap, which is the only thing isCapped needs to be honest about. Azure caps a page at
// AZURE_MAX_PAGE_SIZE, so "one past the cap" short-circuits on the second page, keeping this to two
// Requests at worst
export const countSurveyResponses = async (surveyId: Resource["id"]): Promise<CountSurveyResponsesOutput> => {
  const surveyResponseClient = await useTableClient(AzureTable.SurveyResponses);
  const count = await countEntities(
    surveyResponseClient,
    { filter: getSurveyResponseFilter(surveyId) },
    AZURE_MAX_PAGE_SIZE + 1,
  );
  return count > AZURE_MAX_PAGE_SIZE ? { count: AZURE_MAX_PAGE_SIZE, isCapped: true } : { count, isCapped: false };
};
