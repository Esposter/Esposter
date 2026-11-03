import { SurveyExpressionBinaryOperator } from "#src/models/SurveyExpressionBinaryOperator";
import type { SurveyExpressionBinaryOperatorDefinition } from "#src/models/SurveyExpressionBinaryOperatorDefinition";

// Every spelling of a binary operator, keyed by its text as the tokenizer lowercases it. The powers run from `or` up to
// `^`, so each operator binds tighter than the ones above it in the list
export const SurveyExpressionBinaryOperatorMap: Readonly<Record<string, SurveyExpressionBinaryOperatorDefinition>> = {
  "!=": { operator: SurveyExpressionBinaryOperator.NotEqual, power: 3 },
  "%": { operator: SurveyExpressionBinaryOperator.Modulo, power: 5 },
  "&&": { operator: SurveyExpressionBinaryOperator.And, power: 2 },
  "*": { operator: SurveyExpressionBinaryOperator.Multiply, power: 5 },
  "+": { operator: SurveyExpressionBinaryOperator.Add, power: 4 },
  "-": { operator: SurveyExpressionBinaryOperator.Subtract, power: 4 },
  "/": { operator: SurveyExpressionBinaryOperator.Divide, power: 5 },
  "<": { operator: SurveyExpressionBinaryOperator.Less, power: 3 },
  "<=": { operator: SurveyExpressionBinaryOperator.LessOrEqual, power: 3 },
  "<>": { operator: SurveyExpressionBinaryOperator.NotEqual, power: 3 },
  "=": { operator: SurveyExpressionBinaryOperator.Equal, power: 3 },
  "==": { operator: SurveyExpressionBinaryOperator.Equal, power: 3 },
  ">": { operator: SurveyExpressionBinaryOperator.Greater, power: 3 },
  ">=": { operator: SurveyExpressionBinaryOperator.GreaterOrEqual, power: 3 },
  "^": { operator: SurveyExpressionBinaryOperator.Power, power: 6, rightAssociative: true },
  allof: { operator: SurveyExpressionBinaryOperator.AllOf, power: 3 },
  and: { operator: SurveyExpressionBinaryOperator.And, power: 2 },
  anyof: { operator: SurveyExpressionBinaryOperator.AnyOf, power: 3 },
  contains: { operator: SurveyExpressionBinaryOperator.Contains, power: 3 },
  notcontains: { operator: SurveyExpressionBinaryOperator.NotContains, power: 3 },
  or: { operator: SurveyExpressionBinaryOperator.Or, power: 1 },
  "||": { operator: SurveyExpressionBinaryOperator.Or, power: 1 },
};
