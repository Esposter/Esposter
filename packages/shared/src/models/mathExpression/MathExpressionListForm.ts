// How a function takes a square-bracketed list: not at all, as its argument list with the arity it has, spread into any
// Number of arguments, or only as a list
export enum MathExpressionListForm {
  Argument = "argument",
  None = "none",
  Only = "only",
  Spread = "spread",
}
