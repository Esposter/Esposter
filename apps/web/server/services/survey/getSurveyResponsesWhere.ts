import type { ResourceInResource } from "@esposter/db-schema";

import { surveyResponsesInResource } from "@esposter/db-schema";
import { and, eq } from "drizzle-orm";

// A survey's submitted responses. Every read that counts, lists or joins them starts here, so a respondent who
// Answered one question and left is a response on no surface rather than on some
export const getSurveyResponsesWhere = (surveyId: ResourceInResource["id"]) =>
  and(eq(surveyResponsesInResource.resourceId, surveyId), eq(surveyResponsesInResource.isDraft, false));
