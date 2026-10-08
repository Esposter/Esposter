import type { ExcelSkillDepotRow } from "#src/models/genshinAssets/stats/ExcelSkillDepotRow";
import type { ExcelSkillRow } from "#src/models/genshinAssets/stats/ExcelSkillRow";

import { toCharacterTalentKit } from "#src/services/genshinAssets/stats/toCharacterTalentKit";
import { CombatTalent } from "genshin-world";
import { describe, expect, test } from "vitest";

const CHARACTER_ID = 10_000_002;
const NORMAL_ATTACK_ID = 1;
const SKILL_ID = 2;
const BURST_ID = 3;
const skillMap: ReadonlyMap<number, ExcelSkillRow> = new Map<number, ExcelSkillRow>([
  [BURST_ID, { cdTime: 15, costElemVal: 60, id: BURST_ID, maxChargeNum: 1, proudSkillGroupId: 13 }],
  [NORMAL_ATTACK_ID, { cdTime: 0, costElemVal: 0, id: NORMAL_ATTACK_ID, maxChargeNum: 1, proudSkillGroupId: 11 }],
  [SKILL_ID, { cdTime: 10, costElemVal: 0, id: SKILL_ID, maxChargeNum: 1, proudSkillGroupId: 12 }],
]);
// An own form's set that names no Elemental Skill or burst, as the Traveler's does
const OWN_DEPOT: ExcelSkillDepotRow = {
  id: 1,
  LHNAJLJNBAH: [{ KGGNNMEALJM: 1, proudSkillGroupId: 21 }],
  skills: [NORMAL_ATTACK_ID, 0, 0, 0],
};
const ELEMENT_DEPOT: ExcelSkillDepotRow = {
  energySkill: BURST_ID,
  id: 2,
  LHNAJLJNBAH: [{ KGGNNMEALJM: 4, proudSkillGroupId: 22 }],
  skills: [NORMAL_ATTACK_ID, SKILL_ID, 0, 0],
};

describe(toCharacterTalentKit, () => {
  test("takes the talents and passives of the first set that names all three", () => {
    expect.hasAssertions();
    expect(toCharacterTalentKit(CHARACTER_ID, [OWN_DEPOT, ELEMENT_DEPOT], skillMap)).toStrictEqual({
      characterId: CHARACTER_ID,
      passives: [{ phase: 4, proudSkillGroupId: 22 }],
      talentGroupIds: {
        [CombatTalent.ElementalBurst]: 13,
        [CombatTalent.ElementalSkill]: 12,
        [CombatTalent.NormalAttack]: 11,
      },
    });
  });

  test("leaves the character out where no set names all three", () => {
    expect.hasAssertions();
    expect(toCharacterTalentKit(CHARACTER_ID, [OWN_DEPOT], skillMap)).toBeUndefined();
  });
});
