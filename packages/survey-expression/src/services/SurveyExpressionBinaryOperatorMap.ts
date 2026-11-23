import type { SurveyExpressionBinaryOperatorDefinition } from "#src/models/SurveyExpressionBinaryOperatorDefinition";

import { SurveyExpressionBinaryOperator } from "#src/models/SurveyExpressionBinaryOperator";

// Every spelling of a binary operator, keyed by its text as the tokenizer lowercases it. The list is in the sorting
// Plugin's collation of spelling (`Intl.Collator`, so punctuation sorts before letters), not of power: each entry's
// Power sets how tightly it binds, from `or` (1) up to `^` (6)
export const SurveyExpressionBinaryOperatorMap: Readonly<Record<string, SurveyExpressionBinaryOperatorDefinition>> = {
  "-": { operator: SurveyExpressionBinaryOperator.Subtract, power: 4 },
  "!=": { operator: SurveyExpressionBinaryOperator.NotEqual, power: 3 },
  "*": { operator: SurveyExpressionBinaryOperator.Multiply, power: 5 },
  "/": { operator: SurveyExpressionBinaryOperator.Divide, power: 5 },
  "%": { operator: SurveyExpressionBinaryOperator.Modulo, power: 5 },
  "^": { operator: SurveyExpressionBinaryOperator.Power, power: 6, rightAssociative: true },
  "+": { operator: SurveyExpressionBinaryOperator.Add, power: 4 },
  "<": { operator: SurveyExpressionBinaryOperator.Less, power: 3 },
  "<=": { operator: SurveyExpressionBinaryOperator.LessOrEqual, power: 3 },
  "=": { operator: SurveyExpressionBinaryOperator.Equal, power: 3 },
  ">": { operator: SurveyExpressionBinaryOperator.Greater, power: 3 },
  ">=": { operator: SurveyExpressionBinaryOperator.GreaterOrEqual, power: 3 },
  allof: { operator: SurveyExpressionBinaryOperator.AllOf, power: 3 },
  and: { operator: SurveyExpressionBinaryOperator.And, power: 2 },
  anyof: { operator: SurveyExpressionBinaryOperator.AnyOf, power: 3 },
  contains: { operator: SurveyExpressionBinaryOperator.Contains, power: 3 },
  notcontains: { operator: SurveyExpressionBinaryOperator.NotContains, power: 3 },
  or: { operator: SurveyExpressionBinaryOperator.Or, power: 1 },
};
