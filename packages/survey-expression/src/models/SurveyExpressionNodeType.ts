// Each member's value is the `type` a node of the parsed tree carries
export enum SurveyExpressionNodeType {
  Binary = "binary",
  Call = "call",
  List = "list",
  Literal = "literal",
  Reference = "reference",
  Unary = "unary",
}
