import type { Context } from "#server/trpc/context";
import type { ResourceInResource, SurveyResponseInResource } from "@esposter/db-schema";

import { getBasePaginationData } from "#server/services/pagination/getBasePaginationData";
import { getSurveyResponsesWhere } from "#server/services/survey/getSurveyResponsesWhere";
import { surveyResponsesInResource } from "@esposter/db-schema";
import { MAX_READ_LIMIT } from "@esposter/shared";
import { asc } from "drizzle-orm";

// The one capped read of a survey's responses. The dataset provider and the Responses blade's record read both go
// Through it, so the response ids the blade threads always line up with the rows it renders. Reading one row past the
// Cap answers "is there more?" for free — without it, a survey holding exactly the cap would pay a full count scan
// Just to learn it was never truncated
export const readSurveyResponseEntities = async (
  db: Context["db"],
  surveyId: ResourceInResource["id"],
): Promise<{ hasMore: boolean; surveyResponses: SurveyResponseInResource[] }> => {
  const rows = await db
    .select()
    .from(surveyResponsesInResource)
    .where(getSurveyResponsesWhere(surveyId))
    .orderBy(asc(surveyResponsesInResource.id))
    .limit(MAX_READ_LIMIT + 1);
  const { hasMore, items: surveyResponses } = getBasePaginationData(rows, MAX_READ_LIMIT);
  return { hasMore, surveyResponses };
};
