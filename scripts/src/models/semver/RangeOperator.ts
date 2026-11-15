// Every operator a range may write; expansion replaces the caret and tilde with bounds before a comparator exists
export const RangeOperator = {
  Caret: "^",
  Equal: "=",
  GreaterThan: ">",
  GreaterThanOrEqual: ">=",
  LessThan: "<",
  LessThanOrEqual: "<=",
  Tilde: "~",
} as const;
export type RangeOperator = (typeof RangeOperator)[keyof typeof RangeOperator];
