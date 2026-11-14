import type { ResourceInResource, SurveyResponseEntity, Clause } from "@esposter/db-schema";

import { SurveyResponseEntityPropertyNames, BinaryOperator, CompositeKeyPropertyNames } from "@esposter/db-schema";

// A survey's submitted responses. Every read that counts, lists or joins them starts here, so a respondent who
// Answered one question and left is a response on no surface rather than on some
export const getSurveyResponsesFilter = (surveyId: ResourceInResource["id"]): Clause<SurveyResponseEntity>[] => [
  { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.Eq, value: surveyId },
  { key: SurveyResponseEntityPropertyNames.isDraft, operator: BinaryOperator.Eq, value: null },
];
