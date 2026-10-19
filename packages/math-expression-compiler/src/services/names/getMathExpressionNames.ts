import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { getMathExpressionConstant } from "#src/services/compiler/getMathExpressionConstant";
import { walkNode } from "#src/services/names/walkNode";

// The column names a formula reads before it assigns them, which the edit form checks are columns before saving.
// A name the formula only assigns is not one, and neither is a constant of mathjs's
export const getMathExpressionNames = (node: MathExpressionNode): string[] => {
  const bound = new Set<string>();
  const free = new Set<string>();
  walkNode(node, bound, free);
  return [...free].filter((name) => getMathExpressionConstant(name) === undefined);
};
