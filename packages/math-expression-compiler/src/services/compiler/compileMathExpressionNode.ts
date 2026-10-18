import type { MathExpressionCompileContext } from "#src/models/compiler/MathExpressionCompileContext";
import type { MathExpressionCompiled } from "#src/models/compiler/MathExpressionCompiled";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { NO_LOCALS, NO_VALUES } from "#src/services/compiler/constants";
import { MathExpressionNodeCompileMap } from "#src/services/compiler/MathExpressionNodeCompileMap";

// Compiles a node with the compiler of its type.
// A subtree that reads no variable and no assignment is computed once, here, and an error it folds to is kept as an error
export const compileMathExpressionNode = (
  node: MathExpressionNode,
  context: MathExpressionCompileContext,
): MathExpressionCompiled => {
  // The one cast: the map entry for the node's type takes a node of that type, which is this node
  const compileOfType = MathExpressionNodeCompileMap[node.type] as (
    node: MathExpressionNode,
    context: MathExpressionCompileContext,
  ) => MathExpressionCompiled;
  const compiled = compileOfType(node, context);
  if (!compiled.isConstant) return compiled;

  const value = compiled.evaluate(NO_VALUES, NO_LOCALS);
  return { evaluate: () => value, isConstant: true };
};
