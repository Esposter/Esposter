import type { Clause, Resource, SurveyResponseEntity } from "@esposter/db-schema";

import { serializeClauses } from "@esposter/db";
import { BinaryOperator, CompositeKeyPropertyNames } from "@esposter/db-schema";

// The one definition of "this survey's responses" — the capped read and the count that follows it must
// Select the same rows, or the count would answer for a different question than the rows on screen
export const getSurveyResponseFilter = (surveyId: Resource["id"]): string => {
  const clauses: Clause<SurveyResponseEntity>[] = [
    { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: surveyId },
  ];
  return serializeClauses(clauses);
};
