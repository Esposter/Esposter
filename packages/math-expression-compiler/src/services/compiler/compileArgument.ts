import type { MathExpressionCompileContext } from "#src/models/compiler/MathExpressionCompileContext";
import type { MathExpressionCompiledArgument } from "#src/models/compiler/MathExpressionCompiledArgument";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";
import { compileList } from "#src/services/compiler/compileList";

// A call's argument is the numbers of a list, or the compiled value of any other node
export const compileArgument = (
  node: MathExpressionNode,
  context: MathExpressionCompileContext,
): MathExpressionCompiledArgument => {
  if (node.type === MathExpressionNodeType.List) return compileList(node.elements, context);

  return context.compile(node);
};
