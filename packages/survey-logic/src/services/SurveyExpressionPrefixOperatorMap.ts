import { SurveyExpressionUnaryOperator } from "#src/models/SurveyExpressionUnaryOperator";
import type { SurveyExpressionUnaryOperatorDefinition } from "#src/models/SurveyExpressionUnaryOperatorDefinition";

// The prefix operators. `not` takes an operand that holds the comparisons, so it binds looser than them and tighter
// Than `and`. Negation's operand takes `^`, so `-2 ^ 2` is `-(2 ^ 2)`, and it binds tighter than a product
export const SurveyExpressionPrefixOperatorMap: Readonly<Record<string, SurveyExpressionUnaryOperatorDefinition>> = {
  "-": { operator: SurveyExpressionUnaryOperator.Negate, power: 6 },
  not: { operator: SurveyExpressionUnaryOperator.Not, power: 3 },
};
