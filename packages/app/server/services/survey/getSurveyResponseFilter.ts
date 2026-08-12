import type { Resource } from "@esposter/db-schema";

import { getPartitionKeyFilter } from "@esposter/db";

// The one definition of "this survey's responses" — the capped read and the count that follows it must
// Select the same rows, or the count would answer for a different question than the rows on screen
// The one definition of "this survey's responses" — the capped read and the count that qualifies it must
// Select the same rows, or the total would answer for a different question than the rows it reports on
export const getSurveyResponseFilter = (surveyId: Resource["id"]): string => getPartitionKeyFilter(surveyId);
