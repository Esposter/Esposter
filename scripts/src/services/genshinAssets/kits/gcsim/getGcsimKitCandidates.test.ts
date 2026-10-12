import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { getGcsimKitCandidates } from "#src/services/genshinAssets/kits/gcsim/getGcsimKitCandidates";
import { CombatTalent, WeaponType } from "genshin-world";
import { describe, expect, test } from "vitest";

const toConstant = (value: GoValue) => ({ elementLines: {}, file: "skill.go", line: 1, value });

describe(getGcsimKitCandidates, () => {
  test("reads a press's and a hold's hitmarks listed one for each burst state as no hits, the hold still read", () => {
    expect.hasAssertions();

    const gcsim: GcsimCharacter = {
      attacks: [],
      config: { abilityHitboxesMap: new Map(), names: [], talentVariables: [] },
      configFile: "config.yml",
      constantMap: new Map([
        ["skillHoldFrames", toConstant(80)],
        ["skillHoldHitmarks", toConstant([55, 55])],
        ["skillPressHitmarks", toConstant([32, 33])],
      ]),
      filePaths: [],
      folder: "razor",
      queuedAttacks: [],
      talentFile: "razor.go",
      talentParameterMap: new Map(),
      travelMap: new Map(),
    };
    const tables: KitTables = {
      characterId: 0,
      labelMap: new Map(),
      name: "Razor",
      talentGroupIdMap: {
        [CombatTalent.ElementalBurst]: 0,
        [CombatTalent.ElementalSkill]: 0,
        [CombatTalent.NormalAttack]: 0,
      },
      talentMultiplierMap: {},
      weaponType: WeaponType.Claymore,
    };
    const candidateMap = getGcsimKitCandidates(gcsim, tables, gcsim);

    expect(
      ["skill.hits.length", "skillHolds.length", "skillHolds.0.action.hits.length"].map((path) =>
        candidateMap.get(path)?.map(({ value }) => value),
      ),
    ).toStrictEqual([undefined, [1], undefined]);
  });

  test("reads a burst's hits from its queue calls, each at the damage delay its call passes, where it has no hitmark constant", () => {
    expect.hasAssertions();

    const gcsim: GcsimCharacter = {
      attacks: [
        {
          attackTag: "attacks.AttackTagElementalBurst",
          fieldLineMap: {},
          file: "burst.go",
          line: 6,
          variableName: "ai",
        },
      ],
      config: { abilityHitboxesMap: new Map(), names: [], talentVariables: [] },
      configFile: "config.yml",
      constantMap: new Map([["burstFrames", { elementLines: {}, file: "burst.go", line: 1, value: 90 }]]),
      filePaths: [],
      folder: "jean",
      queuedAttacks: [{ attackName: "ai", delay: 55, delayLine: 7, file: "burst.go", line: 7 }],
      talentFile: "zz_jean.go",
      talentParameterMap: new Map(),
      travelMap: new Map(),
    };
    const tables: KitTables = {
      characterId: 0,
      labelMap: new Map(),
      name: "Jean",
      talentGroupIdMap: {
        [CombatTalent.ElementalBurst]: 0,
        [CombatTalent.ElementalSkill]: 0,
        [CombatTalent.NormalAttack]: 0,
      },
      talentMultiplierMap: {},
      weaponType: WeaponType.Sword,
    };
    const candidateMap = getGcsimKitCandidates(gcsim, tables, gcsim);

    expect(
      ["burst.hits.length", "burst.hits.0.hitmarkFrames"].map((path) =>
        candidateMap.get(path)?.map(({ value }) => value),
      ),
    ).toStrictEqual([[1], [55]]);
  });

  test("reads a skill's frames from the first state of its list of frames", () => {
    expect.hasAssertions();

    const gcsim: GcsimCharacter = {
      attacks: [],
      config: { abilityHitboxesMap: new Map(), names: [], talentVariables: [] },
      configFile: "config.yml",
      constantMap: new Map([["skillFrames", toConstant([{ animationFrames: 50 }, { animationFrames: 80 }])]]),
      filePaths: [],
      folder: "mona",
      queuedAttacks: [],
      talentFile: "mona.go",
      talentParameterMap: new Map(),
      travelMap: new Map(),
    };
    const tables: KitTables = {
      characterId: 0,
      labelMap: new Map(),
      name: "Mona",
      talentGroupIdMap: {
        [CombatTalent.ElementalBurst]: 0,
        [CombatTalent.ElementalSkill]: 0,
        [CombatTalent.NormalAttack]: 0,
      },
      talentMultiplierMap: {},
      weaponType: WeaponType.Catalyst,
    };
    const candidateMap = getGcsimKitCandidates(gcsim, tables, gcsim);

    expect(candidateMap.get("skill.animationFrames")?.map(({ value }) => value)).toStrictEqual([50]);
  });

  test("reads a skill's frames from the first state of each level of its nested list of frames", () => {
    expect.hasAssertions();

    const gcsim: GcsimCharacter = {
      attacks: [],
      config: { abilityHitboxesMap: new Map(), names: [], talentVariables: [] },
      configFile: "config.yml",
      constantMap: new Map([
        ["skillFrames", toConstant([[{ animationFrames: 40 }, { animationFrames: 60 }], [{ animationFrames: 70 }]])],
      ]),
      filePaths: [],
      folder: "navia",
      queuedAttacks: [],
      talentFile: "navia.go",
      talentParameterMap: new Map(),
      travelMap: new Map(),
    };
    const tables: KitTables = {
      characterId: 0,
      labelMap: new Map(),
      name: "Navia",
      talentGroupIdMap: {
        [CombatTalent.ElementalBurst]: 0,
        [CombatTalent.ElementalSkill]: 0,
        [CombatTalent.NormalAttack]: 0,
      },
      talentMultiplierMap: {},
      weaponType: WeaponType.Claymore,
    };
    const candidateMap = getGcsimKitCandidates(gcsim, tables, gcsim);

    expect(candidateMap.get("skill.animationFrames")?.map(({ value }) => value)).toStrictEqual([40]);
  });

  test("gives a burst with no attack under its tag no hits", () => {
    expect.hasAssertions();

    const gcsim: GcsimCharacter = {
      attacks: [],
      config: { abilityHitboxesMap: new Map(), names: [], talentVariables: [] },
      configFile: "config.yml",
      constantMap: new Map([["burstFrames", toConstant({ animationFrames: 90 })]]),
      filePaths: [],
      folder: "barbara",
      queuedAttacks: [],
      talentFile: "barbara.go",
      talentParameterMap: new Map(),
      travelMap: new Map(),
    };
    const tables: KitTables = {
      characterId: 0,
      labelMap: new Map(),
      name: "Barbara",
      talentGroupIdMap: {
        [CombatTalent.ElementalBurst]: 0,
        [CombatTalent.ElementalSkill]: 0,
        [CombatTalent.NormalAttack]: 0,
      },
      talentMultiplierMap: {},
      weaponType: WeaponType.Catalyst,
    };
    const candidateMap = getGcsimKitCandidates(gcsim, tables, gcsim);

    expect(candidateMap.get("burst.hits.length")?.map(({ value }) => value)).toStrictEqual([0]);
  });
});
