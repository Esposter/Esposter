// The rules of a formula's grammar. Each rule parses its operands with the rule below it in the chain, from the loosest
// Binding to the tightest, so a formula's parse is that chain, and an operator-bearing rule is a key of the operator map
export const MathExpressionGrammarRule = {
  Assignment: "Assignment",
  Binary: "Binary",
  Conditional: "Conditional",
  LeftHand: "LeftHand",
  Nullish: "Nullish",
  Percentage: "Percentage",
  Power: "Power",
  Symbol: "Symbol",
  Unary: "Unary",
} as const;
export type MathExpressionGrammarRule = (typeof MathExpressionGrammarRule)[keyof typeof MathExpressionGrammarRule];
