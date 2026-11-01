import type { ExcelSkillDepotRow } from "#src/models/genshinAssets/stats/ExcelSkillDepotRow";
import type { ExcelSkillRow } from "#src/models/genshinAssets/stats/ExcelSkillRow";
import type { CharacterTalentKit } from "genshin-world";

import { characterTalentKitSchema, CombatTalent } from "genshin-world";

// A character's talents from the first of its skill sets that names a proud skill group for each of its three combat
// Talents, the sets given in the order they are read (`getCharacterSkillDepotRows`). Each combat talent is named by its
// Skill, and each passive by its proud skill group's name in `proudSkillNameTextIdMap`. Its passives are the ones that
// Same set opens. A set naming none for one of them is passed over, as the Traveler's own form is, whose Elemental Skill
// And Burst its element forms hold
export const toCharacterTalentKit = (
  characterId: number,
  depotRows: readonly ExcelSkillDepotRow[],
  skillMap: ReadonlyMap<number, ExcelSkillRow>,
  proudSkillNameTextIdMap: ReadonlyMap<number, string>,
): CharacterTalentKit | undefined => {
  const getProudSkillGroupId = (skillId = 0): number => skillMap.get(skillId)?.proudSkillGroupId ?? 0;
  const getSkillNameTextId = (skillId = 0): string => {
    const nameTextMapHash = skillMap.get(skillId)?.nameTextMapHash;
    return nameTextMapHash ? String(nameTextMapHash) : "";
  };
  for (const { energySkill, LLEFDMDOMGG, skills } of depotRows) {
    const [normalAttackSkillId, elementalSkillId] = skills;
    const talentGroupIds = {
      [CombatTalent.ElementalBurst]: getProudSkillGroupId(energySkill),
      [CombatTalent.ElementalSkill]: getProudSkillGroupId(elementalSkillId),
      [CombatTalent.NormalAttack]: getProudSkillGroupId(normalAttackSkillId),
    };
    if (Object.values(talentGroupIds).every((groupId) => groupId > 0))
      return characterTalentKitSchema.parse({
        characterId,
        passives: LLEFDMDOMGG.filter(({ proudSkillGroupId }) => proudSkillGroupId > 0).map(
          ({ DHIEHDPAFGI, proudSkillGroupId }) => ({
            nameTextId: proudSkillNameTextIdMap.get(proudSkillGroupId) ?? "",
            phase: DHIEHDPAFGI,
            proudSkillGroupId,
          }),
        ),
        talentGroupIds,
        talentNames: {
          [CombatTalent.ElementalBurst]: { nameTextId: getSkillNameTextId(energySkill) },
          [CombatTalent.ElementalSkill]: { nameTextId: getSkillNameTextId(elementalSkillId) },
          [CombatTalent.NormalAttack]: { nameTextId: getSkillNameTextId(normalAttackSkillId) },
        },
      });
  }
  return undefined;
};
