import type { ExcelGcgSkillRow } from "#src/models/genshinAssets/gcg/ExcelGcgSkillRow";
import type { GcgDeckSliceSkill } from "#src/models/genshinAssets/shared/GcgDeckSliceSkill";

import { toCosts } from "#src/services/genshinAssets/gcg/toCosts";
import { toSkillKind } from "#src/services/genshinAssets/gcg/toSkillKind";

export const toSkill = (skillRow: ExcelGcgSkillRow, costTypes: Set<string>): GcgDeckSliceSkill => {
  const kind = toSkillKind(skillRow.skillTagList);
  return {
    costs: toCosts(skillRow.costList, skillRow.id, costTypes),
    effect: skillRow.skillJson,
    energyGain: skillRow.energyRecharge,
    id: skillRow.id,
    kind,
  };
};
