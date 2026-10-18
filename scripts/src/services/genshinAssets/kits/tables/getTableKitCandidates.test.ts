import type { KitTableLabel } from "#src/models/genshinAssets/kits/tables/KitTableLabel";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { getTableKitCandidates } from "#src/services/genshinAssets/kits/tables/getTableKitCandidates";
import { CombatTalent, WeaponType } from "genshin-world";
import { describe, expect, test } from "vitest";

const SKILL_GROUP_ID = 13_032;

const createTables = (skillLabels: KitTableLabel[]): KitTables => ({
  characterId: 10_000_130,
  labelMap: new Map([[SKILL_GROUP_ID, skillLabels]]),
  name: "Linnea",
  talentGroupIdMap: {
    [CombatTalent.ElementalBurst]: 13_039,
    [CombatTalent.ElementalSkill]: SKILL_GROUP_ID,
    [CombatTalent.NormalAttack]: 13_031,
  },
  talentMultiplierMap: {},
  weaponType: WeaponType.Catalyst,
});

describe(getTableKitCandidates, () => {
  test("reads the skill's Lumi Duration as the lumi duration parameter, at its index in the skill group", () => {
    expect.hasAssertions();
    const candidates = getTableKitCandidates(
      createTables([
        { indexes: [4], label: "CD" },
        { indexes: [3], label: "Lumi Duration" },
      ]),
    );
    expect(candidates.get("parameters.lumiDuration")).toStrictEqual([
      {
        provenance: { index: 3, label: "Lumi Duration", proudSkillGroupId: SKILL_GROUP_ID, source: KitSource.Tables },
        value: { index: 3, proudSkillGroupId: SKILL_GROUP_ID },
      },
    ]);
  });

  test("reads the skill's Masterstroke duration as the masterstroke duration parameter, at its index in the skill group", () => {
    expect.hasAssertions();
    const candidates = getTableKitCandidates(createTables([{ indexes: [11], label: "Masterstroke" }]));
    expect(candidates.get("parameters.masterstrokeDuration")).toStrictEqual([
      {
        provenance: { index: 11, label: "Masterstroke", proudSkillGroupId: SKILL_GROUP_ID, source: KitSource.Tables },
        value: { index: 11, proudSkillGroupId: SKILL_GROUP_ID },
      },
    ]);
  });
});
