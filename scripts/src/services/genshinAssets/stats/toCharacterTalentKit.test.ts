import type { ExcelSkillDepotRow } from "#src/models/genshinAssets/stats/ExcelSkillDepotRow";
import type { ExcelSkillRow } from "#src/models/genshinAssets/stats/ExcelSkillRow";

import { toCharacterTalentKit } from "#src/services/genshinAssets/stats/toCharacterTalentKit";
import { CombatTalent } from "genshin-world";
import { describe, expect, test } from "vitest";

describe(toCharacterTalentKit, () => {
  const CHARACTER_ID = 10_000_002;
  const NORMAL_ATTACK_ID = 1;
  const SKILL_ID = 2;
  const BURST_ID = 3;
  const NORMAL_ATTACK_NAME_TEXT_HASH = 101;
  const SKILL_NAME_TEXT_HASH = 102;
  const BURST_NAME_TEXT_HASH = 103;
  const PASSIVE_NAME_TEXT_ID = "1";
  const skillMap: ReadonlyMap<number, ExcelSkillRow> = new Map<number, ExcelSkillRow>([
    [
      BURST_ID,
      {
        cdTime: 15,
        costElemVal: 60,
        id: BURST_ID,
        maxChargeNum: 1,
        nameTextMapHash: BURST_NAME_TEXT_HASH,
        proudSkillGroupId: 13,
      },
    ],
    [
      NORMAL_ATTACK_ID,
      {
        cdTime: 0,
        costElemVal: 0,
        id: NORMAL_ATTACK_ID,
        maxChargeNum: 1,
        nameTextMapHash: NORMAL_ATTACK_NAME_TEXT_HASH,
        proudSkillGroupId: 11,
      },
    ],
    [
      SKILL_ID,
      {
        cdTime: 10,
        costElemVal: 0,
        id: SKILL_ID,
        maxChargeNum: 1,
        nameTextMapHash: SKILL_NAME_TEXT_HASH,
        proudSkillGroupId: 12,
      },
    ],
  ]);
  // The first level's name of each proud skill group, which a passive is named by
  const proudSkillNameTextIdMap: ReadonlyMap<number, string> = new Map([[22, PASSIVE_NAME_TEXT_ID]]);
  // An own form's set that names no Elemental Skill or burst, as the Traveler's does
  const OWN_DEPOT: ExcelSkillDepotRow = {
    energySkill: 0,
    id: 1,
    LLEFDMDOMGG: [{ DHIEHDPAFGI: 1, proudSkillGroupId: 21 }],
    skills: [NORMAL_ATTACK_ID, 0, 0, 0],
    talents: [],
  };
  const ELEMENT_DEPOT: ExcelSkillDepotRow = {
    energySkill: BURST_ID,
    id: 2,
    LLEFDMDOMGG: [{ DHIEHDPAFGI: 4, proudSkillGroupId: 22 }],
    skills: [NORMAL_ATTACK_ID, SKILL_ID, 0, 0],
    talents: [],
  };

  test("takes the talents, their names and the passives of the first set that names all three", () => {
    expect.hasAssertions();
    expect(
      toCharacterTalentKit(CHARACTER_ID, [OWN_DEPOT, ELEMENT_DEPOT], skillMap, proudSkillNameTextIdMap),
    ).toStrictEqual({
      characterId: CHARACTER_ID,
      passives: [{ nameTextId: PASSIVE_NAME_TEXT_ID, phase: 4, proudSkillGroupId: 22 }],
      talentGroupIds: {
        [CombatTalent.ElementalBurst]: 13,
        [CombatTalent.ElementalSkill]: 12,
        [CombatTalent.NormalAttack]: 11,
      },
      talentNames: {
        [CombatTalent.ElementalBurst]: { nameTextId: String(BURST_NAME_TEXT_HASH) },
        [CombatTalent.ElementalSkill]: { nameTextId: String(SKILL_NAME_TEXT_HASH) },
        [CombatTalent.NormalAttack]: { nameTextId: String(NORMAL_ATTACK_NAME_TEXT_HASH) },
      },
    });
  });

  test("leaves the character out where no set names all three", () => {
    expect.hasAssertions();
    expect(toCharacterTalentKit(CHARACTER_ID, [OWN_DEPOT], skillMap, proudSkillNameTextIdMap)).toBeUndefined();
  });
});
