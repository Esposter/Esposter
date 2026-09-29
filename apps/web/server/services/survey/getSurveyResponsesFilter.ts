import type { Clause } from "@esposter/azure";
import type { ResourceInResource, SurveyResponseEntity } from "@esposter/db-schema";

import { BinaryOperator, CompositeKeyPropertyNames, getTableNullClause, serializeClauses } from "@esposter/azure";
import { SurveyResponseEntityPropertyNames } from "@esposter/db-schema";

// A survey's submitted responses. Every read that counts, lists or joins them starts here, so a respondent who
// Answered one question and left is a response on no surface rather than on some
export const getSurveyResponsesFilter = (surveyId: ResourceInResource["id"]): string => {
  const clauses: Clause<SurveyResponseEntity>[] = [
    { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.Eq, value: surveyId },
    getTableNullClause(SurveyResponseEntityPropertyNames.isDraft),
  ];
  return serializeClauses(clauses);
};
