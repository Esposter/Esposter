import type { GcsimAttack } from "#src/models/genshinAssets/kits/gcsim/GcsimAttack";
import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { KitValueSource } from "#src/models/genshinAssets/kits/KitValueSource";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { GcsimHitboxCenter } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxCenter";
import { GcsimHitboxShape } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxShape";
import { GcsimTalentType } from "#src/models/genshinAssets/kits/gcsim/GcsimTalentType";
import { KitProvisionalCause } from "#src/models/shared/KitProvisionalCause";
import { createTargetedHitArea } from "#src/services/genshinAssets/kits/gcsim/createTargetedHitArea";
import { getGcsimNamedHitCandidates } from "#src/services/genshinAssets/kits/gcsim/getGcsimNamedHitCandidates";
import { getNamedHitKitCandidates } from "#src/services/genshinAssets/kits/record/getNamedHitKitCandidates";
import { CombatTalent, Element, SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA, WeaponType } from "genshin-world";
import { describe, expect, test } from "vitest";

const multiplierMap = (proudSkillGroupId: number) =>
  new Map([["hits.fieryRainArrows.0.multiplier", { index: 0, proudSkillGroupId }]]);

// The cause of a value gcsim gives one, where only the variant of gcsim and rule values carries one
const cause = (provenance: KitValueSource) => ("cause" in provenance ? provenance.cause : undefined);

describe(getGcsimNamedHitCandidates, () => {
  const BURST_PROUD_SKILL_GROUP_ID = 2139;

  // Typed as an attack, so the copies below spread a whole attack, where an index into the array reads as possibly absent
  const burstAttack: GcsimAttack = {
    attackTag: "attacks.AttackTagElementalBurst",
    element: "attributes.Pyro",
    fieldLineMap: { Element: 11 },
    file: "burst.go",
    internalCooldownTag: "attacks.ICDTagNone",
    line: 10,
    siteLine: 10,
    talentVariable: "burst",
  };
  const gcsim: GcsimCharacter = {
    animationFrameNameMap: new Map(),
    attacks: [burstAttack],
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
    goSources: [],
    holdCooldowns: [],
    queuedAttacks: [],
    talentArrayMap: new Map(),
    talentFile: "amber.go",
    talentParameterMap: new Map([["burst|Arrow DMG", [{ index: 0, line: 3 }]]]),
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
  // The Lunar reaction a named hit of the burst's literal gets, its literal's attack tag set to the one given
  const readLunarReaction = (attackTag: string) =>
    getNamedHitKitCandidates(
      multiplierMap(BURST_PROUD_SKILL_GROUP_ID),
      getGcsimNamedHitCandidates(
        { ...gcsim, attacks: [{ ...burstAttack, attackTag, fieldLineMap: { AttackTag: 9, Element: 11 } }] },
        tables,
      ),
    ).get("hits.fieryRainArrows.0.lunarReactionType");

  test("joins a named hit's multiplier to the one literal of its talent variable, and to none for another group", () => {
    expect.hasAssertions();

    const namedHitCandidateMap = getGcsimNamedHitCandidates(gcsim, tables);
    const joined = getNamedHitKitCandidates(multiplierMap(BURST_PROUD_SKILL_GROUP_ID), namedHitCandidateMap);

    expect([...joined.keys()]).toStrictEqual([
      "hits.fieryRainArrows.0.multiplier",
      "hits.fieryRainArrows.0.element",
      "hits.fieryRainArrows.0.internalCooldownTag",
      "hits.fieryRainArrows.0.poiseDamage",
    ]);
    expect(joined.get("hits.fieryRainArrows.0.element")?.map(({ value }) => value)).toStrictEqual([Element.Pyro]);
    expect(joined.get("hits.fieryRainArrows.0.multiplier")?.map(({ value }) => value)).toStrictEqual([
      { index: 0, proudSkillGroupId: BURST_PROUD_SKILL_GROUP_ID },
    ]);
    expect(getNamedHitKitCandidates(multiplierMap(0), namedHitCandidateMap).size).toBe(0);
  });

  test("keys a named hit's variant at a constellation given beside its base, and its multiplier names that constellation", () => {
    expect.hasAssertions();

    const namedHitCandidateMap = getGcsimNamedHitCandidates(gcsim, tables, [4]);
    const constellationMultiplierMap = new Map<string, unknown>([
      [
        "hits.fieryRainArrows.0.multiplier",
        { constellation: 4, index: 0, proudSkillGroupId: BURST_PROUD_SKILL_GROUP_ID },
      ],
    ]);

    expect(
      getNamedHitKitCandidates(constellationMultiplierMap, namedHitCandidateMap)
        .get("hits.fieryRainArrows.0.multiplier")
        ?.map(({ value }) => value),
    ).toStrictEqual([{ constellation: 4, index: 0, proudSkillGroupId: BURST_PROUD_SKILL_GROUP_ID }]);
    expect(
      getNamedHitKitCandidates(multiplierMap(BURST_PROUD_SKILL_GROUP_ID), namedHitCandidateMap)
        .get("hits.fieryRainArrows.0.multiplier")
        ?.map(({ value }) => value),
    ).toStrictEqual([{ index: 0, proudSkillGroupId: BURST_PROUD_SKILL_GROUP_ID }]);
  });

  test("joins a named hit's fields to its variable's one literal where gcsim reassigns that literal's multiplier, and to none for two literals", () => {
    expect.hasAssertions();

    // Gcsim reassigns a literal's Mult in a closure, a second attack at the literal's own declaration, not a second literal
    const reassigned = { ...burstAttack, line: 14 };
    const reassignedJoined = getNamedHitKitCandidates(
      multiplierMap(BURST_PROUD_SKILL_GROUP_ID),
      getGcsimNamedHitCandidates({ ...gcsim, attacks: [...gcsim.attacks, reassigned] }, tables),
    );
    // A second literal of the variable, declared at its own line, is two literals, so the named hit takes none of them
    const secondLiteral = { ...burstAttack, line: 20, siteLine: 20 };
    const twoLiteralsJoined = getNamedHitKitCandidates(
      multiplierMap(BURST_PROUD_SKILL_GROUP_ID),
      getGcsimNamedHitCandidates({ ...gcsim, attacks: [...gcsim.attacks, secondLiteral] }, tables),
    );

    expect(reassignedJoined.get("hits.fieryRainArrows.0.element")?.map(({ value }) => value)).toStrictEqual([
      Element.Pyro,
    ]);
    expect(twoLiteralsJoined.get("hits.fieryRainArrows.0.element")).toBeUndefined();
  });

  test("gives a named hit the Lunar reaction its literal's attack tag names, from the tag's line, and none for another tag", () => {
    expect.hasAssertions();

    expect(readLunarReaction("attacks.AttackTagDirectLunarCharged")).toStrictEqual([
      { provenance: { file: "internal/characters/amber/burst.go", line: 9, source: "Gcsim" }, value: "LunarCharged" },
    ]);
    expect(readLunarReaction("attacks.AttackTagElementalBurst")).toBeUndefined();
  });

  test("joins a named hit's multiplier to its variable's array by value, where no talent row names it", () => {
    expect.hasAssertions();

    const arrayGcsim: GcsimCharacter = {
      ...gcsim,
      attacks: gcsim.attacks.map((attack) => ({ ...attack, talentVariable: "kick" })),
      config: { ...gcsim.config, talentVariables: [] },
      talentArrayMap: new Map([["kick", { line: 7, rows: [[1.5, 2]] }]]),
      talentParameterMap: new Map(),
    };
    const arrayTables: KitTables = {
      ...tables,
      talentMultiplierMap: {
        [BURST_PROUD_SKILL_GROUP_ID]: [
          { level: 1, paramList: [0.5, 1.5] },
          { level: 2, paramList: [0.6, 2] },
        ],
      },
    };
    const joined = getNamedHitKitCandidates(
      new Map([["hits.kick.0.multiplier", { index: 1, proudSkillGroupId: BURST_PROUD_SKILL_GROUP_ID }]]),
      getGcsimNamedHitCandidates(arrayGcsim, arrayTables),
    );

    expect(joined.get("hits.kick.0.multiplier")?.map(({ value }) => value)).toStrictEqual([
      { index: 1, proudSkillGroupId: BURST_PROUD_SKILL_GROUP_ID },
    ]);
    expect(joined.get("hits.kick.0.multiplier")?.[0]?.provenance).toStrictEqual({
      file: "internal/characters/amber/amber.go",
      line: 7,
      source: "Gcsim",
    });
  });

  test("takes a named list's calls in the order they land, whatever order the source calls them in", () => {
    expect.hasAssertions();

    const namedHitCandidateMap = getGcsimNamedHitCandidates(
      {
        ...gcsim,
        goSources: [],
        queuedAttacks: [
          { attackLine: 10, delay: 120, delayLine: 20, file: "burst.go", lastLine: 19, line: 19 },
          { attackLine: 10, delay: 96, delayLine: 30, file: "burst.go", lastLine: 29, line: 29 },
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

  test("joins a queue call's single-target hit to the targeting area of no radius, and an attack with no poise to none", () => {
    expect.hasAssertions();

    const namedHitCandidateMap = getGcsimNamedHitCandidates(
      {
        ...gcsim,
        goSources: [],
        queuedAttacks: [
          {
            attackLine: 10,
            delay: 3,
            delayLine: 11,
            file: "burst.go",
            hitbox: {
              center: GcsimHitboxCenter.PrimaryTarget,
              file: "burst.go",
              line: 11,
              name: "NewSingleTargetHit",
              radius: 0,
              shape: GcsimHitboxShape.Circle,
            },
            lastLine: 11,
            line: 11,
          },
        ],
      },
      tables,
    );
    const joined = getNamedHitKitCandidates(multiplierMap(BURST_PROUD_SKILL_GROUP_ID), namedHitCandidateMap);

    expect(
      joined.get("hits.fieryRainArrows.0.area")?.map(({ provenance, value }) => [cause(provenance), value]),
    ).toStrictEqual([
      [KitProvisionalCause.TargetCentred, { angle: 2 * Math.PI, height: 2, radius: SKILL_TARGETING_AREA.radius }],
    ]);
    expect(joined.get("hits.fieryRainArrows.0.hitmarkFrames")?.map(({ value }) => value)).toStrictEqual([3]);
    expect(
      joined.get("hits.fieryRainArrows.0.poiseDamage")?.map(({ provenance, value }) => [cause(provenance), value]),
    ).toStrictEqual([[KitProvisionalCause.NoPoiseSource, 0]]);
  });

  test("prices a normal or charged attack's named hit round the strikes' targeting area, and a burst's round the skill's", () => {
    expect.hasAssertions();

    const NORMAL_PROUD_SKILL_GROUP_ID = 2131;
    const radius = 0.8;
    const readArea = (type: GcsimTalentType, proudSkillGroupId: number) =>
      getNamedHitKitCandidates(
        multiplierMap(proudSkillGroupId),
        getGcsimNamedHitCandidates(
          {
            ...gcsim,
            config: {
              ...gcsim.config,
              talentVariables: [
                {
                  leaves: [{ path: [0], reference: { label: "Arrow DMG", selector: 0, type } }],
                  line: 1,
                  name: "burst",
                },
              ],
            },
            queuedAttacks: [
              {
                attackLine: 10,
                delay: 3,
                delayLine: 11,
                file: "burst.go",
                hitbox: {
                  center: GcsimHitboxCenter.PrimaryTarget,
                  file: "burst.go",
                  line: 11,
                  name: "NewCircleHit",
                  radius,
                  shape: GcsimHitboxShape.Circle,
                },
                lastLine: 11,
                line: 11,
              },
            ],
            talentParameterMap: new Map([[`${type}|Arrow DMG`, [{ index: 0, line: 3 }]]]),
          },
          {
            ...tables,
            talentGroupIdMap: { ...tables.talentGroupIdMap, [CombatTalent.NormalAttack]: NORMAL_PROUD_SKILL_GROUP_ID },
          },
        ),
      )
        .get("hits.fieryRainArrows.0.area")
        ?.map(({ value }) => value);

    expect(readArea(GcsimTalentType.Attack, NORMAL_PROUD_SKILL_GROUP_ID)).toStrictEqual([
      createTargetedHitArea(STRIKE_TARGETING_AREA, radius),
    ]);
    expect(readArea(GcsimTalentType.Burst, BURST_PROUD_SKILL_GROUP_ID)).toStrictEqual([
      createTargetedHitArea(SKILL_TARGETING_AREA, radius),
    ]);
  });

  test("joins a single hit's, a skill hold's and a stance's multiplier by its value to the one candidate of its key, and a multiplier of no named hit to none", () => {
    expect.hasAssertions();

    const namedHitCandidateMap = getGcsimNamedHitCandidates(gcsim, tables);
    const joined = getNamedHitKitCandidates(
      new Map<string, unknown>([
        ["hitFields.dragonBreath.multiplier", { index: 0, proudSkillGroupId: BURST_PROUD_SKILL_GROUP_ID }],
        ["hitFields.otherBreath.multiplier", { index: 1, proudSkillGroupId: BURST_PROUD_SKILL_GROUP_ID }],
        ["skillHolds.0.action.hits.0.multiplier", { index: 0, proudSkillGroupId: BURST_PROUD_SKILL_GROUP_ID }],
        [
          "stances.windfavored.normalAttacks.0.hits.0.multiplier",
          { index: 0, proudSkillGroupId: BURST_PROUD_SKILL_GROUP_ID },
        ],
      ]),
      namedHitCandidateMap,
    );

    expect([...joined.keys()].filter((path) => path.endsWith(".element"))).toStrictEqual([
      "hitFields.dragonBreath.element",
      "skillHolds.0.action.hits.0.element",
      "stances.windfavored.normalAttacks.0.hits.0.element",
    ]);
    expect(joined.get("hitFields.dragonBreath.element")?.map(({ value }) => value)).toStrictEqual([Element.Pyro]);
  });

  test("gives a call after an if else's branches to the attack of each branch, so each branch's list takes it", () => {
    expect.hasAssertions();

    const SKILL_PROUD_SKILL_GROUP_ID = 15032;
    const attackCommon = {
      attackTag: "attacks.AttackTagElementalArt",
      element: "attributes.Cryo",
      fieldLineMap: {},
      file: "skill.go",
      internalCooldownTag: "attacks.ICDTagNone",
      siteLine: 12,
      variableName: "ai",
    };
    const branchGcsim: GcsimCharacter = {
      ...gcsim,
      attacks: [
        { ...attackCommon, line: 12 },
        {
          ...attackCommon,
          branch: { armCount: 2, chain: 2, endLine: 30, index: 0, isExhaustive: true },
          line: 25,
          talentVariable: "plume",
        },
        {
          ...attackCommon,
          branch: { armCount: 2, chain: 2, endLine: 30, index: 1, isExhaustive: true },
          line: 28,
          talentVariable: "wing",
        },
      ],
      config: {
        abilityHitboxesMap: new Map(),
        names: [],
        talentVariables: [
          {
            leaves: [
              { path: [0], reference: { label: "Plume Dance Move DMG", selector: 0, type: GcsimTalentType.Skill } },
            ],
            line: 1,
            name: "plume",
          },
          {
            leaves: [
              { path: [0], reference: { label: "Wing Dance Move DMG", selector: 0, type: GcsimTalentType.Skill } },
            ],
            line: 2,
            name: "wing",
          },
        ],
      },
      goSources: [],
      queuedAttacks: [{ attackName: "ai", delay: 0, delayLine: 34, file: "skill.go", lastLine: 34, line: 34 }],
      talentParameterMap: new Map([
        ["skill|Plume Dance Move DMG", [{ index: 4, line: 3 }]],
        ["skill|Wing Dance Move DMG", [{ index: 7, line: 4 }]],
      ]),
    };
    const skillTables: KitTables = {
      ...tables,
      talentGroupIdMap: { ...tables.talentGroupIdMap, [CombatTalent.ElementalSkill]: SKILL_PROUD_SKILL_GROUP_ID },
    };

    const namedHitCandidateMap = getGcsimNamedHitCandidates(branchGcsim, skillTables);
    const joined = getNamedHitKitCandidates(
      new Map<string, unknown>([
        ["hits.plume.0.multiplier", { index: 4, proudSkillGroupId: SKILL_PROUD_SKILL_GROUP_ID }],
        ["hits.wing.0.multiplier", { index: 7, proudSkillGroupId: SKILL_PROUD_SKILL_GROUP_ID }],
      ]),
      namedHitCandidateMap,
    );

    expect(
      [4, 7].map((index) => namedHitCandidateMap.get(`${SKILL_PROUD_SKILL_GROUP_ID}|${index}`)?.queuedCalls.length),
    ).toStrictEqual([1, 1]);
    expect(
      ["hits.plume.0.element", "hits.wing.0.element"].map((path) => joined.get(path)?.map(({ value }) => value)),
    ).toStrictEqual([[Element.Cryo], [Element.Cryo]]);
  });

  test("gives a variable whose leaf another variable's label claims no talent array, as its own label is claimed", () => {
    expect.hasAssertions();

    // Both variables' leaves name the one parameter, so the second is labelled by the first's claim and its array joins none
    const claimedGcsim: GcsimCharacter = {
      ...gcsim,
      attacks: [...gcsim.attacks, { ...burstAttack, line: 30, siteLine: 30, talentVariable: "kick" }],
      config: {
        ...gcsim.config,
        talentVariables: [
          ...gcsim.config.talentVariables,
          {
            leaves: [{ path: [0], reference: { label: "Arrow DMG", selector: 0, type: GcsimTalentType.Burst } }],
            line: 2,
            name: "kick",
          },
        ],
      },
      talentArrayMap: new Map([["kick", { line: 7, rows: [[1.5, 2]] }]]),
    };
    const claimedTables: KitTables = {
      ...tables,
      talentMultiplierMap: {
        [BURST_PROUD_SKILL_GROUP_ID]: [
          { level: 1, paramList: [0.5, 1.5] },
          { level: 2, paramList: [0.6, 2] },
        ],
      },
    };

    expect([...getGcsimNamedHitCandidates(claimedGcsim, claimedTables).keys()]).toStrictEqual([
      `${BURST_PROUD_SKILL_GROUP_ID}|0`,
    ]);
  });

  test("gives a named hit no element where two iterations of one literal give it different elements", () => {
    expect.hasAssertions();

    // The two variants of one literal share its declaration, each for one loop iteration with its own element
    const iterationGcsim: GcsimCharacter = {
      ...gcsim,
      attacks: [
        { ...burstAttack, iteration: { value: 0, variable: "i" } },
        { ...burstAttack, element: undefined, iteration: { value: 1, variable: "i" } },
      ],
    };
    const joined = getNamedHitKitCandidates(
      multiplierMap(BURST_PROUD_SKILL_GROUP_ID),
      getGcsimNamedHitCandidates(iterationGcsim, tables),
    );

    expect(joined.get("hits.fieryRainArrows.0.element")).toBeUndefined();
  });
});
