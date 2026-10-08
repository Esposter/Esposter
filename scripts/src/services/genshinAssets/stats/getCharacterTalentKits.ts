import type { ExcelAvatarRow } from "#src/models/genshinAssets/stats/ExcelAvatarRow";
import type { ExcelSkillDepotRow } from "#src/models/genshinAssets/stats/ExcelSkillDepotRow";
import type { ExcelSkillRow } from "#src/models/genshinAssets/stats/ExcelSkillRow";
import type { CharacterTalentKit } from "genshin-world";

import { PLAYABLE_AVATAR_USE_TYPE } from "#src/services/genshinAssets/stats/constants";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { characterTalentKitSchema, CombatTalent } from "genshin-world";

// Every playable character's combat talents and passives, read from its own form's skill set: its normal attack, its
// Elemental Skill and its burst, each by the proud skill group its skill names, and the passives its depot opens. A
// Character whose set names no group for one of its three talents is left out
export const getCharacterTalentKits = (): CharacterTalentKit[] => {
  const skillDepotMap = new Map(
    readExcelTable<ExcelSkillDepotRow>("AvatarSkillDepotExcelConfigData").map((row) => [row.id, row]),
  );
  const skillMap = new Map(readExcelTable<ExcelSkillRow>("AvatarSkillExcelConfigData").map((row) => [row.id, row]));
  const getProudSkillGroupId = (skillId = 0): number => skillMap.get(skillId)?.proudSkillGroupId ?? 0;
  return readExcelTable<ExcelAvatarRow>("AvatarExcelConfigData")
    .filter(({ useType }) => useType === PLAYABLE_AVATAR_USE_TYPE)
    .flatMap(({ id, skillDepotId }) => {
      const depotRow = skillDepotMap.get(skillDepotId);
      if (!depotRow) return [];
      const [normalAttackSkillId, elementalSkillId] = depotRow.skills;
      const talentGroupIds = {
        [CombatTalent.ElementalBurst]: getProudSkillGroupId(depotRow.energySkill),
        [CombatTalent.ElementalSkill]: getProudSkillGroupId(elementalSkillId),
        [CombatTalent.NormalAttack]: getProudSkillGroupId(normalAttackSkillId),
      };
      if (Object.values(talentGroupIds).some((groupId) => groupId === 0)) return [];
      return [
        characterTalentKitSchema.parse({
          characterId: id,
          passives: (depotRow.LHNAJLJNBAH ?? [])
            .filter(({ proudSkillGroupId }) => proudSkillGroupId > 0)
            .map(({ KGGNNMEALJM, proudSkillGroupId }) => ({ phase: KGGNNMEALJM, proudSkillGroupId })),
          talentGroupIds,
        }),
      ];
    });
};
