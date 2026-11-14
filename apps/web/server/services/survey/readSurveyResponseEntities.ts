import type { ResourceInResource } from "@esposter/db-schema";

import { useStreamTableClient } from "#server/composables/streams/useStreamTableClient";
import { getBasePaginationData } from "#server/services/pagination/getBasePaginationData";
import { getSurveyResponsesFilter } from "#server/services/survey/getSurveyResponsesFilter";
import { AZURE_MAX_PAGE_SIZE } from "@esposter/azure";
import { getTopNEntities } from "@esposter/db";
import { StreamTable, SurveyResponseEntity } from "@esposter/db-schema";

// The one capped read of a survey's responses. The dataset provider and the Responses blade's row-key
// Read both go through it, so the row keys the blade threads always line up with the rows it renders.
// Reading one entity past the cap answers "is there more?" for free — without it, a survey holding
// Exactly the cap would pay a full count scan just to learn it was never truncated
export const readSurveyResponseEntities = async (
  surveyId: ResourceInResource["id"],
): Promise<{ hasMore: boolean; surveyResponses: SurveyResponseEntity[] }> => {
  const surveyResponseClient = useStreamTableClient(StreamTable.SurveyResponses);
  const entities = await getTopNEntities(
    surveyResponseClient,
    AZURE_MAX_PAGE_SIZE + 1,
    SurveyResponseEntity,
    getSurveyResponsesFilter(surveyId),
  );
  const { hasMore, items: surveyResponses } = getBasePaginationData(entities, AZURE_MAX_PAGE_SIZE);
  return { hasMore, surveyResponses };
};
