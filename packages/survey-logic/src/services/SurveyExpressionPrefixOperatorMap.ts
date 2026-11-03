import { SurveyExpressionUnaryOperator } from "#src/models/SurveyExpressionUnaryOperator";
import type { SurveyExpressionUnaryOperatorDefinition } from "#src/models/SurveyExpressionUnaryOperatorDefinition";

// The prefix operators. `not` takes an operand that holds the comparisons, so it binds looser than them and tighter
// Than `and`. Negation's power is above `^`, so `-2 ^ 2` is `(-2) ^ 2`
export const SurveyExpressionPrefixOperatorMap: Readonly<Record<string, SurveyExpressionUnaryOperatorDefinition>> = {
  "!": { operator: SurveyExpressionUnaryOperator.Not, power: 3 },
  "-": { operator: SurveyExpressionUnaryOperator.Negate, power: 7 },
  not: { operator: SurveyExpressionUnaryOperator.Not, power: 3 },
};
