// The rules of a formula's grammar. Each rule parses its operands with the rule below it in the chain, from the loosest
// Binding to the tightest, so a formula's parse is that chain, and an operator-bearing rule is a key of the operator map
export enum MathExpressionGrammarRule {
  Assignment = "Assignment",
  Binary = "Binary",
  Conditional = "Conditional",
  DivisionBeforeProduct = "DivisionBeforeProduct",
  ImplicitProduct = "ImplicitProduct",
  LeftHand = "LeftHand",
  Nullish = "Nullish",
  Percentage = "Percentage",
  Power = "Power",
  Symbol = "Symbol",
  Unary = "Unary",
}
