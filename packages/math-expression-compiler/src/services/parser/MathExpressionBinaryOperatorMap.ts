import type {
  MathExpressionBinaryFunctionOperator,
  MathExpressionBinaryOperator,
} from "#src/models/parser/MathExpressionBinaryOperator";

import { MathExpressionLogicalOperator } from "#src/models/shared/MathExpressionLogicalOperator";
import { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";

// The binary operators' tokens, each with its binding power, from one for the loosest operator to ten for the tightest.
// The "*" and "/" entries are named so the implicit and divided products read their function without a check
export const MathExpressionBinaryOperatorMap: {
  readonly "*": MathExpressionBinaryFunctionOperator;
  readonly "/": MathExpressionBinaryFunctionOperator;
  readonly [token: string]: MathExpressionBinaryOperator;
} = {
  "!=": { name: "unequal", power: 7, type: MathExpressionNodeType.Comparison },
  "%": { name: "mod", power: 10, type: MathExpressionNodeType.Binary },
  "&": { name: "bitAnd", power: 6, type: MathExpressionNodeType.Binary },
  "*": { name: "multiply", power: 10, type: MathExpressionNodeType.Binary },
  "+": { name: "add", power: 9, type: MathExpressionNodeType.Binary },
  "-": { name: "subtract", power: 9, type: MathExpressionNodeType.Binary },
  ".*": { name: "dotMultiply", power: 10, type: MathExpressionNodeType.Binary },
  "./": { name: "dotDivide", power: 10, type: MathExpressionNodeType.Binary },
  "/": { name: "divide", power: 10, type: MathExpressionNodeType.Binary },
  "<": { name: "smaller", power: 7, type: MathExpressionNodeType.Comparison },
  "<<": { name: "leftShift", power: 8, type: MathExpressionNodeType.Binary },
  "<=": { name: "smallerEq", power: 7, type: MathExpressionNodeType.Comparison },
  "==": { name: "equal", power: 7, type: MathExpressionNodeType.Comparison },
  ">": { name: "larger", power: 7, type: MathExpressionNodeType.Comparison },
  ">=": { name: "largerEq", power: 7, type: MathExpressionNodeType.Comparison },
  ">>": { name: "rightArithShift", power: 8, type: MathExpressionNodeType.Binary },
  ">>>": { name: "rightLogShift", power: 8, type: MathExpressionNodeType.Binary },
  "^|": { name: "bitXor", power: 5, type: MathExpressionNodeType.Binary },
  and: { operator: MathExpressionLogicalOperator.And, power: 3, type: MathExpressionNodeType.Logical },
  mod: { name: "mod", power: 10, type: MathExpressionNodeType.Binary },
  or: { operator: MathExpressionLogicalOperator.Or, power: 1, type: MathExpressionNodeType.Logical },
  xor: { name: "xor", power: 2, type: MathExpressionNodeType.Binary },
  "|": { name: "bitOr", power: 4, type: MathExpressionNodeType.Binary },
};
