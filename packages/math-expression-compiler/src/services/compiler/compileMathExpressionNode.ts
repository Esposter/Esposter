import type { MathExpressionCompileContext } from "#src/models/compiler/MathExpressionCompileContext";
import type { MathExpressionCompiled } from "#src/models/compiler/MathExpressionCompiled";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";
import type { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";

import { NO_LOCALS, NO_VALUES } from "#src/services/compiler/constants";
import { MathExpressionNodeCompileMap } from "#src/services/compiler/MathExpressionNodeCompileMap";

// Each type's compiler takes the node of that type, so the type parameter ties the node to the entry that compiles it
const compileOfType = <TType extends MathExpressionNodeType>(
  type: TType,
  node: Extract<MathExpressionNode, { type: TType }>,
  context: MathExpressionCompileContext,
): MathExpressionCompiled => MathExpressionNodeCompileMap[type](node, context);

// Compiles a node with the compiler of its type.
// A subtree that reads no variable and no assignment is computed once, here, and an error it folds to is kept as an error
export const compileMathExpressionNode = (
  node: MathExpressionNode,
  context: MathExpressionCompileContext,
): MathExpressionCompiled => {
  const compiled = compileOfType(node.type, node, context);
  if (!compiled.isConstant) return compiled;

  const value = compiled.evaluate(NO_VALUES, NO_LOCALS);
  return { evaluate: () => value, isConstant: true };
};
