import type { ExcelGcgSkillRow } from "#src/models/genshinAssets/gcg/ExcelGcgSkillRow";
import type { GcgCost } from "genshin-world";

import { GCG_COST_TYPE_INVALID } from "#src/services/genshinAssets/gcg/constants";
import { invalidRead } from "#src/services/genshinAssets/gcg/invalidRead";
import { toElement } from "#src/services/genshinAssets/gcg/toElement";
import { GcgCostKind } from "genshin-world";

// The dump's cost lines: an element's die, Matching dice (the character's own element), Unaligned dice of any face, or
// Energy. The dump's empty slots, which hold the invalid cost at its default, are left out
export const toCosts = (costRows: ExcelGcgSkillRow["costList"], rowId: number, costTypes: Set<string>): GcgCost[] =>
  costRows
    .map(({ costType = GCG_COST_TYPE_INVALID, count }) => ({ costType, count }))
    .filter(({ costType }) => costType !== GCG_COST_TYPE_INVALID)
    .map(({ costType, count }): GcgCost => {
      if (!costTypes.has(costType)) throw invalidRead(`the cost table names no cost type ${costType} of row ${rowId}`);
      if (costType === "GCG_COST_DICE_SAME") return { count, kind: GcgCostKind.Matching };
      else if (costType === "GCG_COST_DICE_VOID") return { count, kind: GcgCostKind.Unaligned };
      else if (costType === "GCG_COST_ENERGY") return { count, kind: GcgCostKind.Energy };
      return { count, element: toElement(costType, rowId), kind: GcgCostKind.Dice };
    });
