// A prefix or postfix operator's member, named as the binary operators are, one member per operator
export const SurveyExpressionUnaryOperator = {
  Empty: "empty",
  Negate: "negate",
  Not: "not",
  NotEmpty: "notEmpty",
} as const;
export type SurveyExpressionUnaryOperator =
  (typeof SurveyExpressionUnaryOperator)[keyof typeof SurveyExpressionUnaryOperator];
