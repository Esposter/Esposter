import type { MathExpressionNode } from "#src/models/MathExpressionNode";

import { MathExpressionNodeType } from "#src/models/MathExpressionNodeType";
import { MathExpressionParameterType } from "#src/models/MathExpressionParameterType";

// The kind of value an argument node yields: a list for a list node, and a number for every other node
export const getMathExpressionParameterType = (node: MathExpressionNode): MathExpressionParameterType =>
  node.type === MathExpressionNodeType.List ? MathExpressionParameterType.List : MathExpressionParameterType.Number;
