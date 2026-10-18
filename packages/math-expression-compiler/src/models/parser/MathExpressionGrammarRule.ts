// The rules of a formula's grammar, from the loosest binding to the tightest. Each rule parses its operands with the rule
// Below it, so a formula's parse is the chain of these rules, and an operator-bearing rule is a key of the operator map
export enum MathExpressionGrammarRule {
  Assignment = "Assignment",
  Conditional = "Conditional",
  LogicalOr = "LogicalOr",
  LogicalXor = "LogicalXor",
  LogicalAnd = "LogicalAnd",
  BitwiseOr = "BitwiseOr",
  BitwiseXor = "BitwiseXor",
  BitwiseAnd = "BitwiseAnd",
  Relational = "Relational",
  Shift = "Shift",
  Additive = "Additive",
  Multiplicative = "Multiplicative",
  ImplicitProduct = "ImplicitProduct",
  DivisionBeforeProduct = "DivisionBeforeProduct",
  Percentage = "Percentage",
  Unary = "Unary",
  Power = "Power",
  Nullish = "Nullish",
  LeftHand = "LeftHand",
  Symbol = "Symbol",
}
