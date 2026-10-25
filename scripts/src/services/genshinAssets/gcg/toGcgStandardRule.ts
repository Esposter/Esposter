import type { ExcelGcgElementReactionRow } from "#src/models/genshinAssets/gcg/ExcelGcgElementReactionRow";
import type { ExcelGcgRuleRow } from "#src/models/genshinAssets/gcg/ExcelGcgRuleRow";
import type { GcgStandardRule } from "#src/models/genshinAssets/gcg/GcgStandardRule";

import { GCG_STANDARD_RULE_ID } from "#src/services/genshinAssets/gcg/constants";
import { toRuleElement } from "#src/services/genshinAssets/gcg/toRuleElement";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The standard rule's row with each reaction it lists joined to its element pair, each element spelt as the world's Element
// Enum spells it. A listed reaction the reaction table does not hold is an error, since a reaction without its pair would
// Silently never trigger
export const toGcgStandardRule = (
  ruleRow: ExcelGcgRuleRow,
  reactionRows: ExcelGcgElementReactionRow[],
): GcgStandardRule => ({
  drawCount: ruleRow.drawCardNum,
  handCardLimit: ruleRow.handCardLimit,
  reactions: ruleRow.elementReactionList.map((reactionId) => {
    const reactionRow = reactionRows.find(({ id }) => id === reactionId);
    if (!reactionRow)
      throw new InvalidOperationError(
        Operation.Read,
        "standard rule",
        `rule ${GCG_STANDARD_RULE_ID} lists reaction ${reactionId}, which the reaction table does not hold`,
      );
    return {
      elements: [toRuleElement(reactionRow.elementType1), toRuleElement(reactionRow.elementType2)],
      id: reactionId,
    };
  }),
});
