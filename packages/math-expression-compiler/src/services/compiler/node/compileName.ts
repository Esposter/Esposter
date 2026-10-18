import type { MathExpressionCompileContext } from "#src/models/compiler/MathExpressionCompileContext";
import type { MathExpressionCompiled } from "#src/models/compiler/MathExpressionCompiled";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";
import type { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";

import { compileMathExpressionName } from "#src/services/compiler/compileMathExpressionName";

export const compileName = (
  node: Extract<MathExpressionNode, { type: MathExpressionNodeType.Name }>,
  context: MathExpressionCompileContext,
): MathExpressionCompiled => compileMathExpressionName(node.name, context);
