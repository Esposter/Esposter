import { KitProvisionalCause } from "#src/models/genshinAssets/kits/KitProvisionalCause";
import { KitRule } from "#src/models/genshinAssets/kits/KitRule";
import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { getNamedListKitCandidates } from "#src/services/genshinAssets/kits/candidates/getNamedListKitCandidates";
import { CombatTalent } from "genshin-world";
import { describe, expect, test } from "vitest";

describe(getNamedListKitCandidates, () => {
  const talentGroupIdMap = {
    [CombatTalent.ElementalBurst]: 2139,
    [CombatTalent.ElementalSkill]: 2138,
    [CombatTalent.NormalAttack]: 2137,
  };

  test("gives the burst's hits list no hits of its own when a named list's hit joins to the burst's group", () => {
    expect.hasAssertions();

    const valueMap = new Map<string, unknown>([
      ["burst.hits.length", 3],
      ["hits.fieryRainArrows.0.multiplier", { index: 0, proudSkillGroupId: 2139 }],
      ["hits.fieryRainArrows.1.multiplier", { index: 0, proudSkillGroupId: 2139 }],
    ]);

    expect(getNamedListKitCandidates(valueMap, talentGroupIdMap)).toStrictEqual(
      new Map([
        [
          "burst.hits.length",
          [
            {
              provenance: {
                cause: KitProvisionalCause.NamedHitList,
                rule: KitRule.NamedHitList,
                source: KitSource.Rule,
              },
              value: 0,
            },
          ],
        ],
      ]),
    );
  });

  test("keeps the burst's hits list when its own hit joins the named group at another index", () => {
    expect.hasAssertions();

    const valueMap = new Map<string, unknown>([
      ["burst.hits.length", 1],
      ["burst.hits.0.multiplier", { index: 3, proudSkillGroupId: 2139 }],
      ["hits.fieryRainArrows.0.multiplier", { index: 0, proudSkillGroupId: 2139 }],
    ]);

    expect(getNamedListKitCandidates(valueMap, talentGroupIdMap)).toStrictEqual(new Map());
  });

  test("gives no candidate for a hit that is not a named list's, or joins to the normal attack's group", () => {
    expect.hasAssertions();

    const valueMap = new Map<string, unknown>([
      ["hits.waterBall.0.multiplier", { index: 0, proudSkillGroupId: 2137 }],
      ["skillHolds.0.hits.0.multiplier", { index: 0, proudSkillGroupId: 2138 }],
    ]);

    expect(getNamedListKitCandidates(valueMap, talentGroupIdMap)).toStrictEqual(new Map());
  });
});
