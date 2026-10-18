import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";
import { MathExpressionParameterType } from "#src/models/function/MathExpressionParameterType";

// The kind of value an argument node yields: a list for a list node, and a number for every other node
export const getMathExpressionParameterType = (node: MathExpressionNode): MathExpressionParameterType =>
  node.type === MathExpressionNodeType.List ? MathExpressionParameterType.List : MathExpressionParameterType.Number;
