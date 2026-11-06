import type { Condition } from "#src/models/Condition";
import type { Context } from "#src/models/Context";

import { checkIsListMatch } from "#src/services/checkIsListMatch";

// Whether a condition holds for a context: the mode, the tool and the selection kind each match their list
export const checkIsConditionMet = (condition: Condition, context: Context): boolean => {
  const isModeMatch = checkIsListMatch(condition.modes, context.mode);
  const isToolMatch = checkIsListMatch(condition.tools, context.tool);
  const isSelectionKindMatch = checkIsListMatch(condition.selectionKinds, context.selectionKind);
  return isModeMatch && isToolMatch && isSelectionKindMatch;
};
