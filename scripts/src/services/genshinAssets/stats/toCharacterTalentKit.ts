import type { ExcelSkillDepotRow } from "#src/models/genshinAssets/stats/ExcelSkillDepotRow";
import type { ExcelSkillRow } from "#src/models/genshinAssets/stats/ExcelSkillRow";
import type { CharacterTalentKit, Element } from "genshin-world";

import { characterTalentKitSchema, CombatTalent } from "genshin-world";

// A character's talents from the first of its skill sets that names a proud skill group for each of its three combat
// Talents, the sets given in the order the game lists them, its own form's first. Its passives are the ones that same set
// Opens. A set naming none for one of them is passed over, as the Traveler's own form is, whose Elemental Skill and burst
// Its element forms hold. A form element, where the character has one by default, puts its own set ahead of the others
export const toCharacterTalentKit = (
  characterId: number,
  depotRows: readonly ExcelSkillDepotRow[],
  skillMap: ReadonlyMap<number, ExcelSkillRow>,
  formElement?: Element,
): CharacterTalentKit | undefined => {
  const getProudSkillGroupId = (skillId = 0): number => skillMap.get(skillId)?.proudSkillGroupId ?? 0;
  const orderedDepotRows =
    formElement === undefined
      ? depotRows
      : depotRows.toSorted(
          (firstRow, secondRow) =>
            Number(skillMap.get(secondRow.energySkill ?? 0)?.costElemType === formElement) -
            Number(skillMap.get(firstRow.energySkill ?? 0)?.costElemType === formElement),
        );
  for (const { energySkill, LHNAJLJNBAH = [], skills } of orderedDepotRows) {
    const [normalAttackSkillId, elementalSkillId] = skills;
    const talentGroupIds = {
      [CombatTalent.ElementalBurst]: getProudSkillGroupId(energySkill),
      [CombatTalent.ElementalSkill]: getProudSkillGroupId(elementalSkillId),
      [CombatTalent.NormalAttack]: getProudSkillGroupId(normalAttackSkillId),
    };
    if (Object.values(talentGroupIds).every((groupId) => groupId > 0))
      return characterTalentKitSchema.parse({
        characterId,
        passives: LHNAJLJNBAH.filter(({ proudSkillGroupId }) => proudSkillGroupId > 0).map(
          ({ KGGNNMEALJM, proudSkillGroupId }) => ({ phase: KGGNNMEALJM, proudSkillGroupId }),
        ),
        talentGroupIds,
      });
  }
  return undefined;
};
