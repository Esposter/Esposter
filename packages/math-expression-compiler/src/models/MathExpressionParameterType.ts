// The kind of value one argument of a call is: a number, or a square-bracketed list of numbers. Any is a signature's
// Wildcard, which takes an argument of either kind
export enum MathExpressionParameterType {
  Any = "any",
  List = "list",
  Number = "number",
}
