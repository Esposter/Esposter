import type { MathExpressionCompileContext } from "#src/models/compiler/MathExpressionCompileContext";
import type { MathExpressionCompiled } from "#src/models/compiler/MathExpressionCompiled";
import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { MathExpressionNodeType } from "#src/models/shared/MathExpressionNodeType";
import { compileAssignment } from "#src/services/compiler/node/compileAssignment";
import { compileBinary } from "#src/services/compiler/node/compileBinary";
import { compileCall } from "#src/services/compiler/node/compileCall";
import { compileComparison } from "#src/services/compiler/node/compileComparison";
import { compileConditional } from "#src/services/compiler/node/compileConditional";
import { compileGroup } from "#src/services/compiler/node/compileGroup";
import { compileListNode } from "#src/services/compiler/node/compileListNode";
import { compileLogical } from "#src/services/compiler/node/compileLogical";
import { compileName } from "#src/services/compiler/node/compileName";
import { compileNumber } from "#src/services/compiler/node/compileNumber";
import { compilePercentage } from "#src/services/compiler/node/compilePercentage";
import { compileUnary } from "#src/services/compiler/node/compileUnary";

// The compiler of each node type, which takes the node of that type; the mapped type checks each entry against its own node
export const MathExpressionNodeCompileMap: {
  [T in MathExpressionNodeType]: (
    node: Extract<MathExpressionNode, { type: T }>,
    context: MathExpressionCompileContext,
  ) => MathExpressionCompiled;
} = {
  [MathExpressionNodeType.Assignment]: compileAssignment,
  [MathExpressionNodeType.Binary]: compileBinary,
  [MathExpressionNodeType.Call]: compileCall,
  [MathExpressionNodeType.Comparison]: compileComparison,
  [MathExpressionNodeType.Conditional]: compileConditional,
  [MathExpressionNodeType.Group]: compileGroup,
  [MathExpressionNodeType.List]: compileListNode,
  [MathExpressionNodeType.Logical]: compileLogical,
  [MathExpressionNodeType.Name]: compileName,
  [MathExpressionNodeType.Number]: compileNumber,
  [MathExpressionNodeType.Percentage]: compilePercentage,
  [MathExpressionNodeType.Unary]: compileUnary,
};
