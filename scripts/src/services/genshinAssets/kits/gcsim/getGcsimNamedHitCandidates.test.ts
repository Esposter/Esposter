import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { GcsimTalentType } from "#src/models/genshinAssets/kits/gcsim/GcsimTalentType";
import { getGcsimNamedHitCandidates } from "#src/services/genshinAssets/kits/gcsim/getGcsimNamedHitCandidates";
import { getNamedHitKitCandidates } from "#src/services/genshinAssets/kits/record/getNamedHitKitCandidates";
import { CombatTalent, Element, WeaponType } from "genshin-world";
import { describe, expect, test } from "vitest";

const multiplierMap = (proudSkillGroupId: number) =>
  new Map([["hits.fieryRainArrows.0.multiplier", { index: 0, proudSkillGroupId }]]);

describe(getGcsimNamedHitCandidates, () => {
  const BURST_PROUD_SKILL_GROUP_ID = 2139;

  const gcsim: GcsimCharacter = {
    animationFrameNameMap: new Map(),
    attacks: [
      {
        attackTag: "attacks.AttackTagElementalBurst",
        element: "attributes.Pyro",
        fieldLineMap: { Element: 11 },
        file: "burst.go",
        internalCooldownTag: "attacks.ICDTagNone",
        line: 10,
        siteLine: 10,
        talentVariable: "burst",
      },
    ],
    config: {
      abilityHitboxesMap: new Map(),
      names: [],
      talentVariables: [
        {
          leaves: [{ path: [0], reference: { label: "Arrow DMG", selector: 0, type: GcsimTalentType.Burst } }],
          line: 1,
          name: "burst",
        },
      ],
    },
    configFile: "config.yml",
    constantMap: new Map(),
    filePaths: [],
    folder: "amber",
    queuedAttacks: [],
    talentFile: "amber.go",
    talentParameterMap: new Map([["burst|Arrow DMG", { indexes: [0], line: 3 }]]),
    travelMap: new Map(),
  };
  const tables: KitTables = {
    characterId: 0,
    labelMap: new Map(),
    name: "Amber",
    talentGroupIdMap: {
      [CombatTalent.ElementalBurst]: BURST_PROUD_SKILL_GROUP_ID,
      [CombatTalent.ElementalSkill]: 0,
      [CombatTalent.NormalAttack]: 0,
    },
    talentMultiplierMap: {},
    weaponType: WeaponType.Bow,
  };

  test("joins a named hit's multiplier to the one literal of its talent variable, and to none for another group", () => {
    expect.hasAssertions();

    const namedHitCandidateMap = getGcsimNamedHitCandidates(gcsim, tables);
    const joined = getNamedHitKitCandidates(multiplierMap(BURST_PROUD_SKILL_GROUP_ID), namedHitCandidateMap);

    expect([...joined.keys()]).toStrictEqual([
      "hits.fieryRainArrows.0.multiplier",
      "hits.fieryRainArrows.0.element",
      "hits.fieryRainArrows.0.internalCooldownTag",
    ]);
    expect(joined.get("hits.fieryRainArrows.0.element")?.map(({ value }) => value)).toStrictEqual([Element.Pyro]);
    expect(joined.get("hits.fieryRainArrows.0.multiplier")?.map(({ value }) => value)).toStrictEqual([
      { index: 0, proudSkillGroupId: BURST_PROUD_SKILL_GROUP_ID },
    ]);
    expect(getNamedHitKitCandidates(multiplierMap(0), namedHitCandidateMap).size).toBe(0);
  });

  test("takes a named list's calls in the order they land, whatever order the source calls them in", () => {
    expect.hasAssertions();

    const namedHitCandidateMap = getGcsimNamedHitCandidates(
      {
        ...gcsim,
        queuedAttacks: [
          { attackLine: 10, delay: 120, delayLine: 20, file: "burst.go", line: 19 },
          { attackLine: 10, delay: 96, delayLine: 30, file: "burst.go", line: 29 },
        ],
      },
      tables,
    );
    const joined = getNamedHitKitCandidates(
      new Map<string, unknown>([
        ["hits.fieryRainArrows.0.multiplier", { index: 0, proudSkillGroupId: BURST_PROUD_SKILL_GROUP_ID }],
        ["hits.fieryRainArrows.1.multiplier", { index: 0, proudSkillGroupId: BURST_PROUD_SKILL_GROUP_ID }],
      ]),
      namedHitCandidateMap,
    );

    expect(
      ["hits.fieryRainArrows.0.hitmarkFrames", "hits.fieryRainArrows.1.hitmarkFrames"].map((path) =>
        joined.get(path)?.map(({ value }) => value),
      ),
    ).toStrictEqual([[96], [120]]);
  });

  test("joins a skill hold's and a stance's hit to the same talent variable, and a non-hit multiplier to none", () => {
    expect.hasAssertions();

    const namedHitCandidateMap = getGcsimNamedHitCandidates(gcsim, tables);
    const joined = getNamedHitKitCandidates(
      new Map<string, unknown>([
        ["hitFields.dragonBreath.multiplier", { index: 0, proudSkillGroupId: BURST_PROUD_SKILL_GROUP_ID }],
        ["skillHolds.0.action.hits.0.multiplier", { index: 0, proudSkillGroupId: BURST_PROUD_SKILL_GROUP_ID }],
        [
          "stances.windfavored.normalAttacks.0.hits.0.multiplier",
          { index: 0, proudSkillGroupId: BURST_PROUD_SKILL_GROUP_ID },
        ],
      ]),
      namedHitCandidateMap,
    );

    expect([...joined.keys()].filter((path) => path.endsWith(".element"))).toStrictEqual([
      "skillHolds.0.action.hits.0.element",
      "stances.windfavored.normalAttacks.0.hits.0.element",
    ]);
  });
});
