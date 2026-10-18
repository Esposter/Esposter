import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitTableLabel } from "#src/models/genshinAssets/kits/tables/KitTableLabel";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { getKitHitLabelMap } from "#src/services/genshinAssets/kits/tables/getKitHitLabelMap";
import { CombatTalent, WeaponType } from "genshin-world";
import { describe, expect, test } from "vitest";

const SKILL_GROUP_ID = 12_632;

const createCandidate = (index: number): KitCandidate => ({
  provenance: { index, label: "", proudSkillGroupId: SKILL_GROUP_ID, source: KitSource.Tables },
  value: { index, proudSkillGroupId: SKILL_GROUP_ID },
});

const createTables = (labelMap: Map<number, KitTableLabel[]>): KitTables => ({
  characterId: 10_000_126,
  labelMap,
  name: "Test",
  talentGroupIdMap: {
    [CombatTalent.ElementalBurst]: 0,
    [CombatTalent.ElementalSkill]: SKILL_GROUP_ID,
    [CombatTalent.NormalAttack]: 0,
  },
  talentMultiplierMap: {},
  weaponType: WeaponType.Catalyst,
});

describe(getKitHitLabelMap, () => {
  test("maps a stance's hit and a hold's hit to the table labels their multipliers name, as a skill's hit is mapped", () => {
    expect.hasAssertions();

    const hitLabelMap = getKitHitLabelMap(
      new Map([
        ["skill.hits.0.multiplier", [createCandidate(0)]],
        ["stances.lunarPhaseShift.normalAttacks.0.hits.0.multiplier", [createCandidate(5)]],
        ["skillHolds.0.action.hits.0.multiplier", [createCandidate(3)]],
      ]),
      createTables(
        new Map([
          [
            SKILL_GROUP_ID,
            [
              { indexes: [0], label: "Skill DMG" },
              { indexes: [5], label: "Lunar Phase Shift 1-Hit DMG" },
              { indexes: [3], label: "Hold DMG" },
            ],
          ],
        ]),
      ),
    );

    expect(hitLabelMap).toStrictEqual(
      new Map([
        ["skill.hits.0", "Skill DMG"],
        ["stances.lunarPhaseShift.normalAttacks.0.hits.0", "Lunar Phase Shift 1-Hit DMG"],
        ["skillHolds.0.action.hits.0", "Hold DMG"],
      ]),
    );
  });
});
