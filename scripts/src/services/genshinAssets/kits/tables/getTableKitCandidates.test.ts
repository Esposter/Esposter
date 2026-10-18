import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { getTableKitCandidates } from "#src/services/genshinAssets/kits/tables/getTableKitCandidates";
import { CombatTalent, WeaponType } from "genshin-world";
import { describe, expect, test } from "vitest";

const BURST_GROUP_ID = 12_239;
const SKILL_GROUP_ID = 12_232;

describe(getTableKitCandidates, () => {
  test("gives a folder-less character's skill and burst hits the parameters of their labels, hit after hit across labels", () => {
    expect.hasAssertions();

    const tables: KitTables = {
      characterId: 10_000_122,
      labelMap: new Map([
        [
          BURST_GROUP_ID,
          [
            { indexes: [0, 1], label: "1-Hit DMG" },
            { indexes: [2, 3], label: "2-Hit DMG" },
          ],
        ],
        [SKILL_GROUP_ID, [{ indexes: [0, 1], label: "Skill DMG" }]],
      ]),
      name: "Nefer",
      talentGroupIdMap: {
        [CombatTalent.ElementalBurst]: BURST_GROUP_ID,
        [CombatTalent.ElementalSkill]: SKILL_GROUP_ID,
        [CombatTalent.NormalAttack]: 12_231,
      },
      talentMultiplierMap: {},
      weaponType: WeaponType.Catalyst,
    };
    const candidateMap = getTableKitCandidates(tables);

    expect([...candidateMap.keys()]).toStrictEqual([
      "burst.hits.0.multiplier",
      "burst.hits.1.multiplier",
      "burst.hits.2.multiplier",
      "burst.hits.3.multiplier",
      "skill.hits.0.multiplier",
      "skill.hits.1.multiplier",
    ]);
    expect(candidateMap.get("burst.hits.2.multiplier")).toStrictEqual([
      {
        provenance: { index: 2, label: "2-Hit DMG", proudSkillGroupId: BURST_GROUP_ID, source: KitSource.Tables },
        value: { index: 2, proudSkillGroupId: BURST_GROUP_ID },
      },
    ]);
  });
});
