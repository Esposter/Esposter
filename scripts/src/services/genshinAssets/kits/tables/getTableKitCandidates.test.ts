import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { getTableKitCandidates } from "#src/services/genshinAssets/kits/tables/getTableKitCandidates";
import { CombatTalent, WeaponType } from "genshin-world";
import { describe, expect, test } from "vitest";

const CLORINDE_NAME = "Clorinde";
const CLORINDE_CHARACTER_ID = 10_000_098;
const NORMAL_ATTACK_GROUP_ID = 9831;
const ELEMENTAL_SKILL_GROUP_ID = 9832;
const ELEMENTAL_BURST_GROUP_ID = 9839;

// Clorinde's elemental skill rows as her table gives them, with the parameter indexes each reads
const CLORINDE_SKILL_LABELS = [
  { indexes: [2], label: "Swift Hunt Bond of Life Gain" },
  { indexes: [5, 7], label: "Impale the Night Healing" },
  { indexes: [8], label: "Bond of Life Conversion" },
  { indexes: [11], label: "Night Vigil Duration" },
];

const createTables = (name: string, characterId: number): KitTables => ({
  characterId,
  labelMap: new Map([[ELEMENTAL_SKILL_GROUP_ID, CLORINDE_SKILL_LABELS]]),
  name,
  talentGroupIdMap: {
    [CombatTalent.ElementalBurst]: ELEMENTAL_BURST_GROUP_ID,
    [CombatTalent.ElementalSkill]: ELEMENTAL_SKILL_GROUP_ID,
    [CombatTalent.NormalAttack]: NORMAL_ATTACK_GROUP_ID,
  },
  talentMultiplierMap: {},
  weaponType: WeaponType.Sword,
});

describe(getTableKitCandidates, () => {
  test("the Night Vigil duration is read from Clorinde's elemental skill row, at the row's own index", () => {
    expect.hasAssertions();

    const candidateMap = getTableKitCandidates(createTables(CLORINDE_NAME, CLORINDE_CHARACTER_ID));

    expect(candidateMap.get("parameters.nightVigilSeconds")).toStrictEqual([
      {
        provenance: {
          index: 11,
          label: "Night Vigil Duration",
          proudSkillGroupId: ELEMENTAL_SKILL_GROUP_ID,
          source: KitSource.Tables,
        },
        value: { index: 11, proudSkillGroupId: ELEMENTAL_SKILL_GROUP_ID },
      },
    ]);
  });

  test("the Impale the Night healing's two parameters are the low and full Bond of Life rows, each at its own index", () => {
    expect.hasAssertions();

    const candidateMap = getTableKitCandidates(createTables(CLORINDE_NAME, CLORINDE_CHARACTER_ID));

    expect({
      full: candidateMap.get("parameters.impaleTheNightFullBondOfLifeHealing")?.[0]?.value,
      low: candidateMap.get("parameters.impaleTheNightLowBondOfLifeHealing")?.[0]?.value,
    }).toStrictEqual({
      full: { index: 7, proudSkillGroupId: ELEMENTAL_SKILL_GROUP_ID },
      low: { index: 5, proudSkillGroupId: ELEMENTAL_SKILL_GROUP_ID },
    });
  });

  test("a character with no mapping of its own reads none of the same labels as parameters", () => {
    expect.hasAssertions();

    const candidateMap = getTableKitCandidates(createTables("Amber", 10_000_021));

    expect([...candidateMap.keys()].filter((path) => path.startsWith("parameters."))).toStrictEqual([]);
  });
});
