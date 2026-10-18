// The rules of a formula's grammar, from the loosest binding to the tightest. Each rule parses its operands with the rule
// Below it, so a formula's parse is the chain of these rules, and an operator-bearing rule is a key of the operator map
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
