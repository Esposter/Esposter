import { MathExpressionGrammarRule } from "#src/models/parser/MathExpressionGrammarRule";
import { MathExpressionLogicalOperator } from "#src/models/shared/MathExpressionLogicalOperator";

// The operator tokens of each rule that has operators, each with the function a node names, or the logical operator a
// Logical node applies
export const MathExpressionOperatorMap: {
  [MathExpressionGrammarRule.Additive]: Readonly<Record<string, string>>;
  [MathExpressionGrammarRule.BitwiseAnd]: Readonly<Record<string, string>>;
  [MathExpressionGrammarRule.BitwiseOr]: Readonly<Record<string, string>>;
  [MathExpressionGrammarRule.BitwiseXor]: Readonly<Record<string, string>>;
  [MathExpressionGrammarRule.LogicalAnd]: Readonly<Record<string, MathExpressionLogicalOperator>>;
  [MathExpressionGrammarRule.LogicalOr]: Readonly<Record<string, MathExpressionLogicalOperator>>;
  [MathExpressionGrammarRule.LogicalXor]: Readonly<Record<string, string>>;
  [MathExpressionGrammarRule.Multiplicative]: Readonly<Record<string, string>>;
  [MathExpressionGrammarRule.Nullish]: Readonly<Record<string, MathExpressionLogicalOperator>>;
  [MathExpressionGrammarRule.Power]: Readonly<Record<string, string>>;
  [MathExpressionGrammarRule.Relational]: Readonly<Record<string, string>>;
  [MathExpressionGrammarRule.Shift]: Readonly<Record<string, string>>;
  [MathExpressionGrammarRule.Unary]: Readonly<Record<string, string>>;
} = {
  [MathExpressionGrammarRule.Additive]: { "+": "add", "-": "subtract" },
  [MathExpressionGrammarRule.BitwiseAnd]: { "&": "bitAnd" },
  [MathExpressionGrammarRule.BitwiseOr]: { "|": "bitOr" },
  [MathExpressionGrammarRule.BitwiseXor]: { "^|": "bitXor" },
  [MathExpressionGrammarRule.LogicalAnd]: { and: MathExpressionLogicalOperator.And },
  [MathExpressionGrammarRule.LogicalOr]: { or: MathExpressionLogicalOperator.Or },
  [MathExpressionGrammarRule.LogicalXor]: { xor: "xor" },
  [MathExpressionGrammarRule.Multiplicative]: {
    "%": "mod",
    "*": "multiply",
    ".*": "dotMultiply",
    "./": "dotDivide",
    "/": "divide",
    mod: "mod",
  },
  [MathExpressionGrammarRule.Nullish]: { "??": MathExpressionLogicalOperator.Nullish },
  [MathExpressionGrammarRule.Power]: { ".^": "dotPow", "^": "pow" },
  [MathExpressionGrammarRule.Relational]: {
    "!=": "unequal",
    "<": "smaller",
    "<=": "smallerEq",
    "==": "equal",
    ">": "larger",
    ">=": "largerEq",
  },
  [MathExpressionGrammarRule.Shift]: { "<<": "leftShift", ">>": "rightArithShift", ">>>": "rightLogShift" },
  [MathExpressionGrammarRule.Unary]: { "+": "unaryPlus", "-": "unaryMinus", not: "not", "~": "bitNot" },
};
