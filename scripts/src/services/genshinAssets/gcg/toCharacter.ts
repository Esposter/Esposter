import type { ExcelGcgCharRow } from "#src/models/genshinAssets/gcg/ExcelGcgCharRow";
import type { ExcelGcgSkillRow } from "#src/models/genshinAssets/gcg/ExcelGcgSkillRow";
import type { GcgDeckSliceCharacter } from "#src/models/genshinAssets/shared/GcgDeckSliceCharacter";

import { findRow } from "#src/services/genshinAssets/gcg/findRow";
import { findTagSuffix } from "#src/services/genshinAssets/gcg/findTagSuffix";
import { invalidRead } from "#src/services/genshinAssets/gcg/invalidRead";
import { toElement } from "#src/services/genshinAssets/gcg/toElement";
import { toSkill } from "#src/services/genshinAssets/gcg/toSkill";

export const toCharacter = (
  characterRow: ExcelGcgCharRow,
  skillRows: ExcelGcgSkillRow[],
  costTypes: Set<string>,
): GcgDeckSliceCharacter => {
  const elementSuffix = findTagSuffix(characterRow.tagList, "GCG_TAG_ELEMENT_");
  const element = elementSuffix === undefined ? undefined : toElement(`GCG_COST_DICE_${elementSuffix}`);
  if (!element) throw invalidRead(`character ${characterRow.id} names no element`);
  const nation = findTagSuffix(characterRow.tagList, "GCG_TAG_NATION_");
  return {
    descriptionTextId: characterRow.descTextMapHash,
    element,
    hp: characterRow.hp,
    id: characterRow.id,
    maxEnergy: characterRow.maxEnergy,
    nameTextId: characterRow.nameTextMapHash,
    ...(nation === undefined ? {} : { nation }),
    skills: characterRow.skillList.map((skillId) => toSkill(findRow(skillRows, skillId, "skill"), costTypes)),
    weapon: findTagSuffix(characterRow.tagList, "GCG_TAG_WEAPON_") ?? "",
  };
};
