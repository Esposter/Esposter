import type { CountSurveyResponsesResult } from "#shared/models/resource/survey/CountSurveyResponsesResult";
import type { Resource } from "@esposter/db-schema";

import { DATASET_MAX_COUNTED_ROWS } from "#shared/services/dataset/constants";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { getPartitionKeyFilter } from "@esposter/azure";
import { countEntities } from "@esposter/db";
import { AzureTable } from "@esposter/db-schema";

// The one response count, for the overview blade and the Responses dataset alike. It counts keys-only rows up
// To one past the cap — that extra key is what distinguishes exactly-cap from beyond-cap, which is the only
// Thing isCapped needs to be honest about.
//
// The cap is the dataset's, not a page size. Counting to a page (AZURE_MAX_PAGE_SIZE) is cheaper — two requests
// Rather than eleven — but a survey between the two ceilings then reads "1000+" on the overview and its real
// Total on the Responses blade, which is one survey with two totals. Only a partition past ten pages pays the
// Difference, and it pays it to say the same number twice
export const countSurveyResponses = async (surveyId: Resource["id"]): Promise<CountSurveyResponsesResult> => {
  const surveyResponseClient = await useTableClient(AzureTable.SurveyResponses);
  const count = await countEntities(
    surveyResponseClient,
    { filter: getPartitionKeyFilter(surveyId) },
    DATASET_MAX_COUNTED_ROWS + 1,
  );
  return count > DATASET_MAX_COUNTED_ROWS
    ? { count: DATASET_MAX_COUNTED_ROWS, isCapped: true }
    : { count, isCapped: false };
};
