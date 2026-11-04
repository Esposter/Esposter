import type { SurveyExpressionUnaryOperatorDefinition } from "#src/models/SurveyExpressionUnaryOperatorDefinition";

import { SurveyExpressionUnaryOperator } from "#src/models/SurveyExpressionUnaryOperator";

// The postfix operators, which take the expression before them and bind at the comparison level
export const SurveyExpressionPostfixOperatorMap: Readonly<Record<string, SurveyExpressionUnaryOperatorDefinition>> = {
  empty: { operator: SurveyExpressionUnaryOperator.Empty, power: 3 },
  notempty: { operator: SurveyExpressionUnaryOperator.NotEmpty, power: 3 },
};
