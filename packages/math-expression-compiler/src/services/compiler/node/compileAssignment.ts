import type { MathExpressionCompileContext } from "#src/models/compiler/MathExpressionCompileContext";
import type { MathExpressionCompiled } from "#src/models/compiler/MathExpressionCompiled";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";
import type { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";

// An assignment stores its value in the slot of its name, and yields the value
export const compileAssignment = (
  node: Extract<MathExpressionNode, { type: MathExpressionNodeType.Assignment }>,
  context: MathExpressionCompileContext,
): MathExpressionCompiled => {
  const slot = context.assignedSlots.get(node.name) ?? 0;
  const compiledValue = context.compile(node.value);
  return {
    evaluate: (values, locals) => {
      const value = compiledValue.evaluate(values, locals);
      locals[slot] = value;
      return value;
    },
    isConstant: false,
  };
};
