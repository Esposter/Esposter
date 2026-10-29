import { KitRule } from "#src/models/genshinAssets/kits/KitRule";
import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { KitProvisionalCause } from "#src/models/shared/KitProvisionalCause";
import { getNamedListKitCandidates } from "#src/services/genshinAssets/kits/candidates/getNamedListKitCandidates";
import { CombatTalent } from "genshin-world";
import { describe, expect, test } from "vitest";

describe(getNamedListKitCandidates, () => {
  const talentGroupIdMap = {
    [CombatTalent.ElementalBurst]: 2139,
    [CombatTalent.ElementalSkill]: 2138,
    [CombatTalent.NormalAttack]: 2137,
  };
  const namedListProvenance = {
    cause: KitProvisionalCause.NamedHitList,
    rule: KitRule.NamedHitList,
    source: KitSource.Rule,
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
      ["burst.hits.0.multiplier", { index: 3, proudSkillGroupId: 2139 }],
      ["burst.hits.length", 1],
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

  test("gives a stance's skill no hits of its own when a named list's hit joins to the skill's group", () => {
    expect.hasAssertions();

    const valueMap = new Map<string, unknown>([
      ["hits.impaleTheNightLowBondOfLife.0.multiplier", { index: 5, proudSkillGroupId: 2138 }],
      ["stances.nightVigil.skill.animationFrames", 43],
    ]);

    expect(getNamedListKitCandidates(valueMap, talentGroupIdMap)).toStrictEqual(
      new Map([
        ["skill.hits.length", [{ provenance: namedListProvenance, value: 0 }]],
        ["stances.nightVigil.skill.hits.length", [{ provenance: namedListProvenance, value: 0 }]],
      ]),
    );
  });

  test("gives each of a stance's normal attacks no hits of its own when a named list's hit joins to the skill's group", () => {
    expect.hasAssertions();

    const valueMap = new Map<string, unknown>([
      ["hits.swiftHuntNormalShot.0.multiplier", { index: 0, proudSkillGroupId: 2138 }],
      ["stances.nightVigil.normalAttacks.0.animationFrames", 18],
      ["stances.nightVigil.normalAttacks.1.animationFrames", 17],
    ]);

    expect(getNamedListKitCandidates(valueMap, talentGroupIdMap)).toStrictEqual(
      new Map([
        ["skill.hits.length", [{ provenance: namedListProvenance, value: 0 }]],
        ["stances.nightVigil.normalAttacks.0.hits.length", [{ provenance: namedListProvenance, value: 0 }]],
        ["stances.nightVigil.normalAttacks.1.hits.length", [{ provenance: namedListProvenance, value: 0 }]],
      ]),
    );
  });

  test("keeps a stance's skill hits list when its own hit joins the named group at another index", () => {
    expect.hasAssertions();

    const valueMap = new Map<string, unknown>([
      ["hits.impaleTheNightLowBondOfLife.0.multiplier", { index: 5, proudSkillGroupId: 2138 }],
      ["stances.nightVigil.skill.animationFrames", 43],
      ["stances.nightVigil.skill.hits.0.multiplier", { index: 3, proudSkillGroupId: 2138 }],
    ]);

    expect(getNamedListKitCandidates(valueMap, talentGroupIdMap)).toStrictEqual(
      new Map([["skill.hits.length", [{ provenance: namedListProvenance, value: 0 }]]]),
    );
  });
});
