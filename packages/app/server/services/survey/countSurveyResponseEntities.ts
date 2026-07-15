import type { Resource } from "@esposter/db-schema";

import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { getSurveyResponseFilter } from "@@/server/services/survey/getSurveyResponseFilter";
import { countEntities } from "@esposter/db";
import { AzureTable } from "@esposter/db-schema";

// The uncapped count behind the row-cap warning. Counting walks the whole partition, so this is only ever
// Worth calling once a capped read is known to have filled — see readSurveyResponseDatasetSource
export const countSurveyResponseEntities = async (surveyId: Resource["id"]): Promise<number> => {
  const surveyResponseClient = await useTableClient(AzureTable.SurveyResponses);
  return countEntities(surveyResponseClient, { filter: getSurveyResponseFilter(surveyId) });
};
