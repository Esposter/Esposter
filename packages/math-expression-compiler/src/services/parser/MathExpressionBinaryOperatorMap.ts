import type {
  MathExpressionBinaryFunctionOperator,
  MathExpressionBinaryOperator,
} from "#src/models/parser/MathExpressionBinaryOperator";

import { MathExpressionBinaryOperatorSymbol } from "#src/models/parser/MathExpressionBinaryOperatorSymbol";
import { MathExpressionLogicalOperator } from "#src/models/shared/MathExpressionLogicalOperator";
import { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";

// The binary operators' tokens, each with its binding power, from one for the loosest operator to ten for the tightest.
// The "*" and "/" entries are named so the implicit and divided products read their function without a check
export const MathExpressionBinaryOperatorMap: {
  readonly "*": MathExpressionBinaryFunctionOperator;
  readonly "/": MathExpressionBinaryFunctionOperator;
  readonly [token: string]: MathExpressionBinaryOperator;
} = {
  [MathExpressionBinaryOperatorSymbol.Add]: { name: "add", power: 9, type: MathExpressionNodeType.Binary },
  [MathExpressionBinaryOperatorSymbol.And]: {
    operator: MathExpressionLogicalOperator.And,
    power: 3,
    type: MathExpressionNodeType.Logical,
  },
  [MathExpressionBinaryOperatorSymbol.BitwiseAnd]: { name: "bitAnd", power: 6, type: MathExpressionNodeType.Binary },
  [MathExpressionBinaryOperatorSymbol.BitwiseOr]: { name: "bitOr", power: 4, type: MathExpressionNodeType.Binary },
  [MathExpressionBinaryOperatorSymbol.BitwiseXor]: { name: "bitXor", power: 5, type: MathExpressionNodeType.Binary },
  [MathExpressionBinaryOperatorSymbol.Divide]: { name: "divide", power: 10, type: MathExpressionNodeType.Binary },
  [MathExpressionBinaryOperatorSymbol.ElementwiseDivide]: {
    name: "dotDivide",
    power: 10,
    type: MathExpressionNodeType.Binary,
  },
  [MathExpressionBinaryOperatorSymbol.ElementwiseMultiply]: {
    name: "dotMultiply",
    power: 10,
    type: MathExpressionNodeType.Binary,
  },
  [MathExpressionBinaryOperatorSymbol.Equal]: { name: "equal", power: 7, type: MathExpressionNodeType.Comparison },
  [MathExpressionBinaryOperatorSymbol.GreaterThan]: {
    name: "larger",
    power: 7,
    type: MathExpressionNodeType.Comparison,
  },
  [MathExpressionBinaryOperatorSymbol.GreaterThanOrEqual]: {
    name: "largerEq",
    power: 7,
    type: MathExpressionNodeType.Comparison,
  },
  [MathExpressionBinaryOperatorSymbol.LessThan]: { name: "smaller", power: 7, type: MathExpressionNodeType.Comparison },
  [MathExpressionBinaryOperatorSymbol.LessThanOrEqual]: {
    name: "smallerEq",
    power: 7,
    type: MathExpressionNodeType.Comparison,
  },
  [MathExpressionBinaryOperatorSymbol.Mod]: { name: "mod", power: 10, type: MathExpressionNodeType.Binary },
  [MathExpressionBinaryOperatorSymbol.Modulo]: { name: "mod", power: 10, type: MathExpressionNodeType.Binary },
  [MathExpressionBinaryOperatorSymbol.Multiply]: { name: "multiply", power: 10, type: MathExpressionNodeType.Binary },
  [MathExpressionBinaryOperatorSymbol.NotEqual]: { name: "unequal", power: 7, type: MathExpressionNodeType.Comparison },
  [MathExpressionBinaryOperatorSymbol.Or]: {
    operator: MathExpressionLogicalOperator.Or,
    power: 1,
    type: MathExpressionNodeType.Logical,
  },
  [MathExpressionBinaryOperatorSymbol.ShiftLeft]: { name: "leftShift", power: 8, type: MathExpressionNodeType.Binary },
  [MathExpressionBinaryOperatorSymbol.ShiftRight]: {
    name: "rightArithShift",
    power: 8,
    type: MathExpressionNodeType.Binary,
  },
  [MathExpressionBinaryOperatorSymbol.Subtract]: { name: "subtract", power: 9, type: MathExpressionNodeType.Binary },
  [MathExpressionBinaryOperatorSymbol.UnsignedShiftRight]: {
    name: "rightLogShift",
    power: 8,
    type: MathExpressionNodeType.Binary,
  },
  [MathExpressionBinaryOperatorSymbol.Xor]: { name: "xor", power: 2, type: MathExpressionNodeType.Binary },
};
