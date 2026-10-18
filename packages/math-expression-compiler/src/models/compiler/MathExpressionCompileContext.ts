import type { MathExpressionCompiled } from "#src/models/compiler/MathExpressionCompiled";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

// What the compiler looks a name up in: the slot of each assigned name, and the index of each variable
// Compile is how a node compiler compiles its children, so the node compilers never import one another
export interface MathExpressionCompileContext {
  assignedSlots: ReadonlyMap<string, number>;
  compile: (node: MathExpressionNode) => MathExpressionCompiled;
  variableIndices: ReadonlyMap<string, number>;
}
