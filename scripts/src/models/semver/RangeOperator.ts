// Every operator a range may write; expansion replaces the caret and tilde with bounds before a comparator exists
export enum RangeOperator {
  Caret = "^",
  Equal = "=",
  GreaterThan = ">",
  GreaterThanOrEqual = ">=",
  LessThan = "<",
  LessThanOrEqual = "<=",
  Tilde = "~",
}
