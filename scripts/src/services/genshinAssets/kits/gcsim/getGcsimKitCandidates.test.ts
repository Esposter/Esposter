import type { GcsimAttack } from "#src/models/genshinAssets/kits/gcsim/GcsimAttack";
import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GcsimTalentParameter } from "#src/models/genshinAssets/kits/gcsim/GcsimTalentParameter";
import type { GcsimTalentVariable } from "#src/models/genshinAssets/kits/gcsim/GcsimTalentVariable";
import type { GoConstant } from "#src/models/genshinAssets/kits/gcsim/GoConstant";
import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { GcsimElement } from "#src/models/genshinAssets/kits/gcsim/GcsimElement";
import { GcsimHitboxCenter } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxCenter";
import { GcsimHitboxShape } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxShape";
import { GcsimTalentType } from "#src/models/genshinAssets/kits/gcsim/GcsimTalentType";
import { KitProvisionalCause } from "#src/models/shared/KitProvisionalCause";
import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import {
  GCSIM_NOELLE_FIXTURE_DIRECTORY,
  GCSIM_ROSARIA_FIXTURE_DIRECTORY,
  GCSIM_SARA_FIXTURE_DIRECTORY,
} from "#src/services/genshinAssets/kits/gcsim/constants.test";
import { createBoxReach } from "#src/services/genshinAssets/kits/gcsim/createBoxReach";
import { createCircleReach } from "#src/services/genshinAssets/kits/gcsim/createCircleReach";
import { createTargetedHitArea } from "#src/services/genshinAssets/kits/gcsim/createTargetedHitArea";
import { GcsimElementMap } from "#src/services/genshinAssets/kits/gcsim/GcsimElementMap";
import { getGcsimKitCandidates } from "#src/services/genshinAssets/kits/gcsim/getGcsimKitCandidates";
import { readGcsimCharacter } from "#src/services/genshinAssets/kits/gcsim/readGcsimCharacter";
import { CombatTalent, Element, InternalCooldownTag, SKILL_TARGETING_AREA, WeaponType } from "genshin-world";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const toConstant = (value: GoValue) => ({ elementLines: {}, file: "skill.go", line: 1, value });
const plungeConstant = (value: GoValue, line: number) => ({ elementLines: {}, file: "plunge.go", line, value });
const frames = (animationFrames: number) => ({ animationFrames, hitmarkFrames: 0 });

const attackConstant = (value: GoValue, line: number, file = "attack.go") => ({ elementLines: {}, file, line, value });
const createCharacterFixture = (
  folder: string,
  {
    attacks = [],
    constants = [],
    talentParameters = [],
    talentVariables = [],
  }: {
    attacks?: GcsimAttack[];
    constants?: [string, GoConstant][];
    talentParameters?: [string, GcsimTalentParameter[]][];
    talentVariables?: GcsimTalentVariable[];
  },
): GcsimCharacter => ({
  animationFrameNameMap: new Map(),
  attacks,
  config: { abilityHitboxesMap: new Map(), names: [], talentVariables },
  configFile: "config.yml",
  constantMap: new Map(constants),
  filePaths: [],
  folder,
  goSources: [],
  holdCooldowns: [],
  queuedAttacks: [],
  talentArrayMap: new Map(),
  talentFile: `${folder}.go`,
  talentParameterMap: new Map(talentParameters),
  travelMap: new Map(),
});

describe(getGcsimKitCandidates, () => {
  const KIT_TABLES: KitTables = {
    characterId: 0,
    labelMap: new Map(),
    name: "Test",
    talentGroupIdMap: {
      [CombatTalent.ElementalBurst]: 1,
      [CombatTalent.ElementalSkill]: 2,
      [CombatTalent.NormalAttack]: 3,
    },
    talentMultiplierMap: {},
    weaponType: WeaponType.Sword,
  };

  test("reads a press's and a hold's hitmarks listed one for each burst state as no hits, the hold still read", () => {
    expect.hasAssertions();

    const gcsim: GcsimCharacter = {
      animationFrameNameMap: new Map(),
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
      goSources: [],
      holdCooldowns: [],
      queuedAttacks: [],
      talentArrayMap: new Map(),
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

  test("gives each level of a hold's hitmarks the hold's frames, one hold for each level", () => {
    expect.hasAssertions();

    const gcsim: GcsimCharacter = {
      animationFrameNameMap: new Map(),
      attacks: [],
      config: { abilityHitboxesMap: new Map(), names: [], talentVariables: [] },
      configFile: "config.yml",
      constantMap: new Map([
        ["skillHoldFrames", toConstant(frames(80))],
        ["skillHoldHitmarks", toConstant([[55, 55], [60]])],
      ]),
      filePaths: [],
      folder: "razor",
      goSources: [],
      holdCooldowns: [],
      queuedAttacks: [],
      talentArrayMap: new Map(),
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
      ["skillHolds.length", "skillHolds.0.action.animationFrames", "skillHolds.1.action.animationFrames"].map((path) =>
        candidateMap.get(path)?.map(({ value }) => value),
      ),
    ).toStrictEqual([[2], [80], [80]]);
  });

  test("reads a normal attack's strikes from a release list named otherwise, and its frames from the first state's list of strikes", () => {
    expect.hasAssertions();

    const gcsim: GcsimCharacter = {
      animationFrameNameMap: new Map(),
      attacks: [],
      config: { abilityHitboxesMap: new Map(), names: [], talentVariables: [] },
      configFile: "config.yml",
      constantMap: new Map([
        [
          "attackFrames",
          toConstant([
            [frames(30), frames(40)],
            [frames(50), frames(60)],
          ]),
        ],
        ["attackReleases", toConstant([[11], [6]])],
      ]),
      filePaths: [],
      folder: "itto",
      goSources: [],
      holdCooldowns: [],
      queuedAttacks: [],
      talentArrayMap: new Map(),
      talentFile: "itto.go",
      talentParameterMap: new Map(),
      travelMap: new Map(),
    };
    const tables: KitTables = {
      characterId: 0,
      labelMap: new Map(),
      name: "Itto",
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
      ["normalAttacks.length", "normalAttacks.1.animationFrames", "normalAttacks.1.hits.length"].map((path) =>
        candidateMap.get(path)?.map(({ value }) => value),
      ),
    ).toStrictEqual([[2], [40], [1]]);
  });

  test("reads a burst's hits from its queue calls, each at the damage delay its call passes, where it has no hitmark constant", () => {
    expect.hasAssertions();

    const gcsim: GcsimCharacter = {
      animationFrameNameMap: new Map(),
      attacks: [
        {
          attackTag: "attacks.AttackTagElementalBurst",
          fieldLineMap: {},
          file: "burst.go",
          line: 6,
          siteLine: 6,
          variableName: "ai",
        },
      ],
      config: { abilityHitboxesMap: new Map(), names: [], talentVariables: [] },
      configFile: "config.yml",
      constantMap: new Map([["burstFrames", { elementLines: {}, file: "burst.go", line: 1, value: 90 }]]),
      filePaths: [],
      folder: "jean",
      goSources: [],
      holdCooldowns: [],
      queuedAttacks: [{ attackName: "ai", delay: 55, delayLine: 7, file: "burst.go", lastLine: 7, line: 7 }],
      talentArrayMap: new Map(),
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

  test("cites a burst's hit count at its queue call's line and its hit at the line of the damage delay the call passes", () => {
    expect.hasAssertions();

    const gcsim: GcsimCharacter = {
      animationFrameNameMap: new Map(),
      attacks: [
        {
          attackTag: "attacks.AttackTagElementalBurst",
          fieldLineMap: {},
          file: "burst.go",
          line: 6,
          siteLine: 6,
          variableName: "ai",
        },
      ],
      config: { abilityHitboxesMap: new Map(), names: [], talentVariables: [] },
      configFile: "config.yml",
      constantMap: new Map([["burstFrames", { elementLines: {}, file: "burst.go", line: 1, value: 90 }]]),
      filePaths: [],
      folder: "jean",
      goSources: [],
      holdCooldowns: [],
      queuedAttacks: [{ attackName: "ai", delay: 92, delayLine: 9, file: "burst.go", lastLine: 7, line: 7 }],
      talentArrayMap: new Map(),
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
      ["burst.hits.length", "burst.hits.0.hitmarkFrames"].map((path) => candidateMap.get(path)?.[0]?.provenance),
    ).toStrictEqual([
      { file: "internal/characters/jean/burst.go", line: 7, source: KitSource.Gcsim },
      { file: "internal/characters/jean/burst.go", line: 9, source: KitSource.Gcsim },
    ]);
  });

  test("reads a single-hit burst's area from the one queue call firing the hit's talent variable, where the hitmark has no hitbox of its own", () => {
    expect.hasAssertions();

    const gcsim: GcsimCharacter = {
      animationFrameNameMap: new Map(),
      attacks: [
        {
          attackTag: "attacks.AttackTagElementalBurst",
          fieldLineMap: {},
          file: "burst.go",
          line: 51,
          siteLine: 51,
          talentVariable: "kick",
          variableName: "ai",
        },
      ],
      config: { abilityHitboxesMap: new Map(), names: [], talentVariables: [] },
      configFile: "config.yml",
      constantMap: new Map([["burstHitmark", { elementLines: {}, file: "burst.go", line: 18, value: 88 }]]),
      filePaths: [],
      folder: "varesa",
      goSources: [],
      holdCooldowns: [],
      queuedAttacks: [
        {
          attackName: "ai",
          delay: 88,
          delayLine: 77,
          file: "burst.go",
          hitbox: {
            center: GcsimHitboxCenter.PrimaryTarget,
            file: "burst.go",
            line: 76,
            name: "NewCircleHit",
            offset: [0, 1],
            radius: 7.5,
            shape: GcsimHitboxShape.Circle,
          },
          lastLine: 74,
          line: 74,
        },
      ],
      talentArrayMap: new Map(),
      talentFile: "zz_varesa.go",
      talentParameterMap: new Map(),
      travelMap: new Map(),
    };
    const tables: KitTables = {
      characterId: 0,
      labelMap: new Map(),
      name: "Varesa",
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
      candidateMap.get("burst.hits.0.area")?.map(({ value }) => (value as { radius: number }).radius),
    ).toStrictEqual([SKILL_TARGETING_AREA.radius + 8.5]);
  });

  test("reads no single-hit burst's area where two queue calls fire the hit's talent variable, one hit's alternatives", () => {
    expect.hasAssertions();

    const gcsim: GcsimCharacter = {
      animationFrameNameMap: new Map(),
      attacks: [
        {
          attackTag: "attacks.AttackTagElementalBurst",
          fieldLineMap: {},
          file: "burst.go",
          line: 51,
          siteLine: 51,
          talentVariable: "kick",
          variableName: "ai",
        },
      ],
      config: { abilityHitboxesMap: new Map(), names: [], talentVariables: [] },
      configFile: "config.yml",
      constantMap: new Map([["burstHitmark", { elementLines: {}, file: "burst.go", line: 18, value: 88 }]]),
      filePaths: [],
      folder: "varesa",
      goSources: [],
      holdCooldowns: [],
      queuedAttacks: [
        {
          attackName: "ai",
          delay: 88,
          delayLine: 77,
          file: "burst.go",
          hitbox: {
            center: GcsimHitboxCenter.PrimaryTarget,
            file: "burst.go",
            line: 76,
            name: "NewCircleHit",
            offset: [0, 1],
            radius: 7.5,
            shape: GcsimHitboxShape.Circle,
          },
          lastLine: 74,
          line: 74,
        },
        {
          attackName: "ai",
          delay: 88,
          delayLine: 79,
          file: "burst.go",
          hitbox: {
            center: GcsimHitboxCenter.PrimaryTarget,
            file: "burst.go",
            line: 76,
            name: "NewCircleHit",
            offset: [0, 1],
            radius: 7.5,
            shape: GcsimHitboxShape.Circle,
          },
          lastLine: 78,
          line: 78,
        },
      ],
      talentArrayMap: new Map(),
      talentFile: "zz_varesa.go",
      talentParameterMap: new Map(),
      travelMap: new Map(),
    };
    const tables: KitTables = {
      characterId: 0,
      labelMap: new Map(),
      name: "Varesa",
      talentGroupIdMap: {
        [CombatTalent.ElementalBurst]: 0,
        [CombatTalent.ElementalSkill]: 0,
        [CombatTalent.NormalAttack]: 0,
      },
      talentMultiplierMap: {},
      weaponType: WeaponType.Sword,
    };
    const candidateMap = getGcsimKitCandidates(gcsim, tables, gcsim);

    expect(candidateMap.get("burst.hits.0.area")).toBeUndefined();
  });

  test("joins a burst's hit to the talent variable of the attack its queue call fires at its hitmark, where a second attack under the burst tag has its own", () => {
    expect.hasAssertions();

    const gcsim: GcsimCharacter = {
      animationFrameNameMap: new Map(),
      attacks: [
        {
          abil: "Lightning Fang",
          attackTag: "attacks.AttackTagElementalBurst",
          element: "attributes.Electro",
          fieldLineMap: {},
          file: "burst.go",
          line: 51,
          siteLine: 51,
          talentVariable: "burstDmg",
          variableName: "ai",
        },
        {
          abil: "The Wolf Within",
          attackTag: "attacks.AttackTagElementalBurst",
          element: "attributes.Electro",
          fieldLineMap: {},
          file: "burst.go",
          line: 90,
          siteLine: 90,
          talentVariable: "wolfDmg",
          variableName: "ai",
        },
      ],
      config: {
        abilityHitboxesMap: new Map(),
        names: [],
        talentVariables: [
          {
            leaves: [{ path: [], reference: { label: "Burst DMG", selector: 0, type: GcsimTalentType.Burst } }],
            line: 6,
            name: "burstDmg",
          },
          {
            leaves: [
              { path: [], reference: { label: "Soul Companion DMG", selector: 0, type: GcsimTalentType.Burst } },
            ],
            line: 7,
            name: "wolfDmg",
          },
        ],
      },
      configFile: "config.yml",
      constantMap: new Map([["burstHitmark", { elementLines: {}, file: "burst.go", line: 24, value: 32 }]]),
      filePaths: [],
      folder: "razor",
      goSources: [],
      holdCooldowns: [],
      queuedAttacks: [
        { attackName: "ai", delay: 32, delayLine: 67, file: "burst.go", lastLine: 67, line: 67 },
        { attackName: "ai", delay: 1, delayLine: 110, file: "burst.go", lastLine: 110, line: 110 },
      ],
      talentArrayMap: new Map(),
      talentFile: "zz_razor.go",
      talentParameterMap: new Map([["burst|Burst DMG", [{ index: 3, line: 40 }]]]),
      travelMap: new Map(),
    };
    const tables: KitTables = {
      characterId: 0,
      labelMap: new Map(),
      name: "Razor",
      talentGroupIdMap: {
        [CombatTalent.ElementalBurst]: 2039,
        [CombatTalent.ElementalSkill]: 2032,
        [CombatTalent.NormalAttack]: 2031,
      },
      talentMultiplierMap: {},
      weaponType: WeaponType.Claymore,
    };
    const candidateMap = getGcsimKitCandidates(gcsim, tables, gcsim);

    expect(
      ["burst.hits.length", "burst.hits.0.multiplier", "burst.hits.0.element"].map((path) =>
        candidateMap.get(path)?.map(({ value }) => value),
      ),
    ).toStrictEqual([[1], [{ index: 3, proudSkillGroupId: 2039 }], [Element.Electro]]);
  });

  test("reads a skill's frames from the first state of its list of frames", () => {
    expect.hasAssertions();

    const gcsim: GcsimCharacter = {
      animationFrameNameMap: new Map(),
      attacks: [],
      config: { abilityHitboxesMap: new Map(), names: [], talentVariables: [] },
      configFile: "config.yml",
      constantMap: new Map([["skillFrames", toConstant([{ animationFrames: 50 }, { animationFrames: 80 }])]]),
      filePaths: [],
      folder: "mona",
      goSources: [],
      holdCooldowns: [],
      queuedAttacks: [],
      talentArrayMap: new Map(),
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
      animationFrameNameMap: new Map(),
      attacks: [],
      config: { abilityHitboxesMap: new Map(), names: [], talentVariables: [] },
      configFile: "config.yml",
      constantMap: new Map([
        ["skillFrames", toConstant([[{ animationFrames: 40 }, { animationFrames: 60 }], [{ animationFrames: 70 }]])],
      ]),
      filePaths: [],
      folder: "navia",
      goSources: [],
      holdCooldowns: [],
      queuedAttacks: [],
      talentArrayMap: new Map(),
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
      animationFrameNameMap: new Map(),
      attacks: [],
      config: { abilityHitboxesMap: new Map(), names: [], talentVariables: [] },
      configFile: "config.yml",
      constantMap: new Map([["burstFrames", toConstant({ animationFrames: 90 })]]),
      filePaths: [],
      folder: "barbara",
      goSources: [],
      holdCooldowns: [],
      queuedAttacks: [],
      talentArrayMap: new Map(),
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

  test("reads each queue call of Noelle's burst as a hit, its second slash a Mult set's copy of the attack the first fires", () => {
    expect.hasAssertions();

    const gcsim = readGcsimCharacter(
      "noelle",
      new Map([
        ["burst.go", readFileSync(join(GCSIM_NOELLE_FIXTURE_DIRECTORY, "burst.go"), "utf8")],
        ["config.yml", readFileSync(join(GCSIM_NOELLE_FIXTURE_DIRECTORY, "config.yml"), "utf8")],
      ]),
    );
    const candidateMap = getGcsimKitCandidates(gcsim, KIT_TABLES, gcsim);

    expect(
      ["burst.hits.length", "burst.hits.0.hitmarkFrames", "burst.hits.1.hitmarkFrames"].map((path) =>
        candidateMap.get(path)?.map(({ value }) => value),
      ),
    ).toStrictEqual([[2], [24], [65]]);
  });

  test("reads each queue call of Rosaria's burst as a hit, her lance's a Mult set's copy of the attack the first fires, and no DoT tick", () => {
    expect.hasAssertions();

    const gcsim = readGcsimCharacter(
      "rosaria",
      new Map([
        ["burst.go", readFileSync(join(GCSIM_ROSARIA_FIXTURE_DIRECTORY, "burst.go"), "utf8")],
        ["config.yml", readFileSync(join(GCSIM_ROSARIA_FIXTURE_DIRECTORY, "config.yml"), "utf8")],
      ]),
    );
    const candidateMap = getGcsimKitCandidates(gcsim, KIT_TABLES, gcsim);

    expect(
      ["burst.hits.length", "burst.hits.0.hitmarkFrames", "burst.hits.1.hitmarkFrames"].map((path) =>
        candidateMap.get(path)?.map(({ value }) => value),
      ),
    ).toStrictEqual([[2], [15], [56]]);
  });

  test("reads no hit from the repeated calls of a Mult set's copy in Kujou Sara's cluster loop, which are its ticks", () => {
    expect.hasAssertions();

    const gcsim = readGcsimCharacter(
      "sara",
      new Map([
        ["burst.go", readFileSync(join(GCSIM_SARA_FIXTURE_DIRECTORY, "burst.go"), "utf8")],
        ["config.yml", readFileSync(join(GCSIM_SARA_FIXTURE_DIRECTORY, "config.yml"), "utf8")],
      ]),
    );
    const candidateMap = getGcsimKitCandidates(gcsim, KIT_TABLES, gcsim);

    expect(
      ["burst.hits.length", "burst.hits.0.hitmarkFrames", "burst.hits.1.hitmarkFrames"].map((path) =>
        candidateMap.get(path)?.map(({ value }) => value),
      ),
    ).toStrictEqual([[1], [51], undefined]);
  });

  test("joins a frames path the kit holds under a constant's name to that constant, and adds no path the kit lacks", () => {
    expect.hasAssertions();

    const gcsim: GcsimCharacter = {
      animationFrameNameMap: new Map(),
      attacks: [],
      config: { abilityHitboxesMap: new Map(), names: [], talentVariables: [] },
      configFile: "config.yml",
      constantMap: new Map([
        ["burstStart", toConstant(123)],
        ["otherStart", toConstant(7)],
      ]),
      filePaths: [],
      folder: "aino",
      goSources: [],
      holdCooldowns: [],
      queuedAttacks: [],
      talentArrayMap: new Map(),
      talentFile: "aino.go",
      talentParameterMap: new Map(),
      travelMap: new Map(),
    };
    const tables: KitTables = {
      characterId: 0,
      labelMap: new Map(),
      name: "Aino",
      talentGroupIdMap: {
        [CombatTalent.ElementalBurst]: 0,
        [CombatTalent.ElementalSkill]: 0,
        [CombatTalent.NormalAttack]: 0,
      },
      talentMultiplierMap: {},
      weaponType: WeaponType.Catalyst,
    };
    const candidateMap = getGcsimKitCandidates(gcsim, tables, gcsim, new Set(["frames.burstStart"]));

    expect(
      ["frames.burstStart", "frames.otherStart", "parameters.burstStart"].map((path) =>
        candidateMap.get(path)?.map(({ value }) => value),
      ),
    ).toStrictEqual([[123], undefined, undefined]);
  });

  test("borrows a plunge with no file of its own from the fallback's plunge file, cited as NoActionFile", () => {
    expect.hasAssertions();

    const gcsim: GcsimCharacter = {
      animationFrameNameMap: new Map(),
      attacks: [],
      config: { abilityHitboxesMap: new Map(), names: [], talentVariables: [] },
      configFile: "config.yml",
      constantMap: new Map(),
      filePaths: [],
      folder: "aino",
      goSources: [],
      holdCooldowns: [],
      queuedAttacks: [],
      talentArrayMap: new Map(),
      talentFile: "aino.go",
      talentParameterMap: new Map(),
      travelMap: new Map(),
    };
    const fallback: GcsimCharacter = {
      ...gcsim,
      constantMap: new Map([
        ["lowPlungeFrames", plungeConstant(frames(67), 38)],
        ["lowPlungeHitmark", plungeConstant(36, 21)],
      ]),
      folder: "bennett",
    };
    const tables: KitTables = {
      characterId: 0,
      labelMap: new Map(),
      name: "Aino",
      talentGroupIdMap: {
        [CombatTalent.ElementalBurst]: 0,
        [CombatTalent.ElementalSkill]: 0,
        [CombatTalent.NormalAttack]: 0,
      },
      talentMultiplierMap: {},
      weaponType: WeaponType.Claymore,
    };
    const candidateMap = getGcsimKitCandidates(gcsim, tables, fallback);

    expect([
      candidateMap
        .get("plunges.low.animationFrames")
        ?.map(({ provenance, value }) => [value, "cause" in provenance ? provenance.cause : undefined]),
      candidateMap
        .get("plunges.low.hits.0.hitmarkFrames")
        ?.map(({ provenance, value }) => [value, "cause" in provenance ? provenance.cause : undefined]),
    ]).toStrictEqual([[[67, KitProvisionalCause.NoActionFile]], [[36, KitProvisionalCause.NoActionFile]]]);
  });

  test("gives a hold's hit no area from a hitbox when two calls fire at its hitmark, as it gives it no attack", () => {
    expect.hasAssertions();

    const hitbox = {
      center: GcsimHitboxCenter.Player,
      file: "skill.go",
      line: 3,
      name: "DamageOverTime",
      radius: 6,
      shape: GcsimHitboxShape.Circle,
    };
    const gcsim: GcsimCharacter = {
      animationFrameNameMap: new Map(),
      attacks: [],
      config: { abilityHitboxesMap: new Map(), names: [], talentVariables: [] },
      configFile: "config.yml",
      constantMap: new Map([
        ["skillHoldFrames", toConstant(80)],
        ["skillHoldHitmarks", toConstant(60)],
      ]),
      filePaths: [],
      folder: "razor",
      goSources: [],
      holdCooldowns: [],
      queuedAttacks: [
        {
          attackLine: undefined,
          attackName: undefined,
          delay: 60,
          delayLine: 4,
          file: "skill.go",
          hitbox,
          lastLine: 4,
          line: 4,
        },
        {
          attackLine: undefined,
          attackName: "hit",
          delay: 60,
          delayLine: 5,
          file: "skill.go",
          hitbox,
          lastLine: 5,
          line: 5,
        },
      ],
      talentArrayMap: new Map(),
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

    expect(candidateMap.get("skillHolds.0.action.hits.0.area")).toBeUndefined();
  });

  test("gives a blade roller's four strikes to the blessing stance, each from its frames, hitbox, poise and talent leaf", () => {
    expect.hasAssertions();

    const gcsim = createCharacterFixture("xilonen", {
      attacks: [
        {
          attackTag: "attacks.AttackTagNormal",
          durability: 25,
          element: "attributes.Geo",
          fieldLineMap: {},
          file: "attack.go",
          internalCooldownTag: "attacks.ICDTagXilonenSkate",
          line: 112,
          siteLine: 112,
          talentVariable: "attackE",
          variableName: "ai",
        },
      ],
      constants: [
        [
          "rollerFrames",
          {
            elementLines: { 0: 51, 1: 54, 2: 57, 3: 60 },
            file: "attack.go",
            line: 49,
            value: [
              { animationFrames: 44, hitmarkFrames: 17 },
              { animationFrames: 48, hitmarkFrames: 17 },
              { animationFrames: 50, hitmarkFrames: 22 },
              { animationFrames: 69, hitmarkFrames: 32 },
            ],
          },
        ],
        [
          "rollerHitboxes",
          attackConstant(
            [
              [2.7, 270],
              [5, 3.7],
              [3.5, 4.5],
              [3.5, 270],
            ],
            25,
          ),
        ],
        ["rollerOffsets", attackConstant([0.7, -0.5, -0.5, 0.6], 26)],
        ["rollerPoiseDMG", attackConstant([52.8, 51.9, 62.1, 81.1], 27)],
      ],
      talentParameters: [["attack|Blade Roller 2-Hit DMG", [{ index: 1, line: 10 }]]],
      talentVariables: [
        {
          leaves: [0, 1, 2, 3].map((index) => ({
            path: [index],
            reference: { label: `Blade Roller ${index + 1}-Hit DMG`, selector: 0, type: GcsimTalentType.Attack },
          })),
          line: 10,
          name: "attackE",
        },
      ],
    });
    const candidateMap = getGcsimKitCandidates(gcsim, KIT_TABLES, gcsim);

    expect(
      [
        "stances.blessing.normalAttacks.length",
        "stances.blessing.normalAttacks.1.animationFrames",
        "stances.blessing.normalAttacks.1.hits.0.hitmarkFrames",
        "stances.blessing.normalAttacks.1.hits.0.poiseDamage",
        "stances.blessing.normalAttacks.1.hits.0.multiplier",
        "stances.blessing.normalAttacks.1.hits.0.internalCooldownTag",
      ].map((path) => candidateMap.get(path)?.map(({ value }) => value)),
    ).toStrictEqual([
      [4],
      [48],
      [17],
      [51.9],
      [{ index: 1, proudSkillGroupId: 3 }],
      [InternalCooldownTag.XilonenSkate],
    ]);
    expect(candidateMap.get("stances.blessing.normalAttacks.1.hits.0.area")?.map(({ value }) => value)).toStrictEqual([
      createBoxReach(-0.5, 5, 3.7),
    ]);
  });

  test("gives a loop shot's two actions to the blessing stance, each striking twice on the player's circle from its hitmarks, the skill's multiplier and its attack", () => {
    expect.hasAssertions();

    const gcsim = createCharacterFixture("kinich", {
      attacks: [
        {
          attackTag: "attacks.AttackTagElementalArt",
          durability: 25,
          element: "attributes.Dendro",
          fieldLineMap: {},
          file: "attack.go",
          internalCooldownTag: "attacks.ICDTagKinichLoopShot",
          line: 115,
          siteLine: 115,
          talentVariable: "loopShot",
          variableName: "ai",
        },
      ],
      constants: [
        ["skillHitNum", attackConstant(2, 35)],
        [
          "skillAttackHitmarks",
          attackConstant(
            [
              [30, 38],
              [31, 38],
            ],
            29,
          ),
        ],
      ],
      talentParameters: [["skill|Loop Shot DMG", [{ index: 0, line: 161 }]]],
      talentVariables: [
        {
          leaves: [{ path: [0], reference: { label: "Loop Shot DMG", selector: 0, type: GcsimTalentType.Skill } }],
          line: 161,
          name: "loopShot",
        },
      ],
    });
    const candidateMap = getGcsimKitCandidates(gcsim, KIT_TABLES, gcsim);
    const valuesAt = (path: string) => candidateMap.get(path)?.map(({ value }) => value);

    expect(valuesAt("stances.blessing.normalAttacks.length")).toStrictEqual([2]);
    expect(valuesAt("stances.blessing.normalAttacks.0.animationFrames")).toStrictEqual([53]);
    expect(valuesAt("stances.blessing.normalAttacks.0.hits.0.hitmarkFrames")).toStrictEqual([30]);
    expect(valuesAt("stances.blessing.normalAttacks.1.hits.0.hitmarkFrames")).toStrictEqual([31]);
    expect(valuesAt("stances.blessing.normalAttacks.1.hits.1.hitmarkFrames")).toStrictEqual([38]);
    expect(valuesAt("stances.blessing.normalAttacks.1.hits.0.area")).toStrictEqual([createCircleReach(0, 0.5)]);
    expect(valuesAt("stances.blessing.normalAttacks.1.hits.0.multiplier")).toStrictEqual([
      { index: 0, proudSkillGroupId: 2 },
    ]);
    expect(valuesAt("stances.blessing.normalAttacks.1.hits.0.element")).toStrictEqual([Element.Dendro]);
    expect(valuesAt("stances.blessing.normalAttacks.1.hits.0.internalCooldownTag")).toStrictEqual([
      InternalCooldownTag.KinichLoopShot,
    ]);
  });

  test("gives a shell's six hitmarks as the frames its shells are cast at, and its templates the burst's six-metre circle", () => {
    expect.hasAssertions();

    const gcsim = createCharacterFixture("chasca", {
      attacks: [
        {
          attackTag: "attacks.AttackTagElementalBurst",
          durability: 25,
          element: "attributes.Anemo",
          fieldLineMap: { Durability: 51, Element: 50, ICDTag: 47 },
          file: "burst.go",
          internalCooldownTag: "attacks.ICDTagNone",
          line: 42,
          siteLine: 42,
          talentVariable: "burstGalesplitting",
          variableName: "ai",
        },
      ],
      constants: [["burstSecondaryHitmark", attackConstant([103, 139, 147, 153, 157, 160], 18)]],
      talentParameters: [
        ["burst|Soulseeker Shell DMG", [{ index: 1, line: 5 }]],
        ["burst|Radiant Soulseeker Shell DMG", [{ index: 2, line: 6 }]],
      ],
      talentVariables: [
        {
          leaves: [
            { path: [], reference: { label: "Soulseeker Shell DMG", selector: 0, type: GcsimTalentType.Burst } },
          ],
          line: 5,
          name: "burstSoulseeker",
        },
        {
          leaves: [
            {
              path: [],
              reference: { label: "Radiant Soulseeker Shell DMG", selector: 0, type: GcsimTalentType.Burst },
            },
          ],
          line: 6,
          name: "burstRadiant",
        },
      ],
    });
    const candidateMap = getGcsimKitCandidates(gcsim, KIT_TABLES, gcsim);
    const valuesAt = (path: string) => candidateMap.get(path)?.map(({ value }) => value);

    expect([
      valuesAt("frames.shellHitmarks.length"),
      valuesAt("frames.shellHitmarks.2"),
      valuesAt("hits.soulseekerShell.hitmarkFrames"),
      valuesAt("hits.soulseekerShell.multiplier"),
      valuesAt("hits.soulseekerShell.element"),
      valuesAt("hits.radiantShell.multiplier"),
      valuesAt("hits.radiantShell.element"),
      valuesAt("hits.radiantShell.gauge"),
      valuesAt("hits.soulseekerShell.internalCooldownTag"),
      valuesAt("hits.radiantShell.internalCooldownTag"),
    ]).toStrictEqual([
      [6],
      [147],
      [103],
      [{ index: 1, proudSkillGroupId: 1 }],
      [GcsimElementMap[GcsimElement.Anemo]],
      [{ index: 2, proudSkillGroupId: 1 }],
      undefined,
      [1],
      [InternalCooldownTag.ChascaBurst],
      [InternalCooldownTag.ChascaBurst],
    ]);
    expect(valuesAt("hits.soulseekerShell.area")).toStrictEqual([createTargetedHitArea(SKILL_TARGETING_AREA, 6)]);
  });

  test("gives a cloud its explosion on the target and its timings as frames, its first hit landing after its travel", () => {
    expect.hasAssertions();

    const gcsim = createCharacterFixture("mizuki", {
      attacks: [
        {
          attackTag: "attacks.AttackTagElementalArt",
          durability: 25,
          element: "attributes.Anemo",
          fieldLineMap: { Durability: 186, Element: 185, ICDTag: 181 },
          file: "skill.go",
          internalCooldownTag: "attacks.ICDTagElementalArt",
          line: 177,
          poiseDamage: 20,
          siteLine: 177,
          talentVariable: "cloudDMG",
          variableName: "cloudAttack",
        },
      ],
      constants: [
        ["cloudExplosionRadius", attackConstant(4, 32, "skill.go")],
        ["cloudTravelTime", attackConstant(30, 33, "skill.go")],
        ["cloudFirstHit", attackConstant(18, 34, "skill.go")],
        ["cloudHitInterval", attackConstant(45, 35, "skill.go")],
      ],
      talentParameters: [["skill|Continuous Attack DMG", [{ index: 0, line: 3 }]]],
      talentVariables: [
        {
          leaves: [
            { path: [], reference: { label: "Continuous Attack DMG", selector: 0, type: GcsimTalentType.Skill } },
          ],
          line: 3,
          name: "cloudDMG",
        },
      ],
    });
    const candidateMap = getGcsimKitCandidates(gcsim, KIT_TABLES, gcsim);
    const valuesAt = (path: string) => candidateMap.get(path)?.map(({ value }) => value);

    expect([
      valuesAt("frames.cloudTravelTime"),
      valuesAt("frames.cloudFirstHit"),
      valuesAt("frames.cloudHitInterval"),
      valuesAt("hits.cloud.hitmarkFrames"),
      valuesAt("hits.cloud.multiplier"),
    ]).toStrictEqual([[30], [18], [45], [18], [{ index: 0, proudSkillGroupId: 2 }]]);
    expect(valuesAt("hits.cloud.area")).toStrictEqual([createTargetedHitArea(SKILL_TARGETING_AREA, 4)]);
  });

  test("gives Fiery Passion's skill the rush's frames and multiplier, and its flying kick the burst variant's", () => {
    expect.hasAssertions();

    const gcsim = createCharacterFixture("varesa", {
      attacks: [
        {
          attackTag: "attacks.AttackTagElementalArt",
          durability: 25,
          element: "attributes.Electro",
          fieldLineMap: {},
          file: "skill.go",
          internalCooldownTag: "attacks.ICDTagVaresaCombatCycle",
          line: 47,
          siteLine: 47,
          talentVariable: "rush",
          variableName: "ai",
        },
        {
          attackTag: "attacks.AttackTagElementalBurst",
          durability: 25,
          element: "attributes.Electro",
          fieldLineMap: {},
          file: "burst.go",
          internalCooldownTag: "attacks.ICDTagNone",
          line: 48,
          siteLine: 48,
          talentVariable: "kick",
          variableName: "ai",
        },
      ],
      constants: [
        ["fierySkillFrames", attackConstant(frames(52), 33, "skill.go")],
        ["fierySkillHitmark", attackConstant(2, 19, "skill.go")],
        ["burstFrames", attackConstant(frames(122), 27, "burst.go")],
        ["burstHitmark", attackConstant(88, 18, "burst.go")],
      ],
      talentParameters: [
        ["skill|Fiery Passion Rush DMG", [{ index: 0, line: 3 }]],
        ["burst|Fiery Passion Flying Kick DMG", [{ index: 0, line: 4 }]],
      ],
      talentVariables: [
        {
          leaves: [
            { path: [], reference: { label: "Fiery Passion Rush DMG", selector: 0, type: GcsimTalentType.Skill } },
          ],
          line: 3,
          name: "fieryRush",
        },
        {
          leaves: [
            {
              path: [],
              reference: { label: "Fiery Passion Flying Kick DMG", selector: 0, type: GcsimTalentType.Burst },
            },
          ],
          line: 4,
          name: "fieryKick",
        },
      ],
    });
    const candidateMap = getGcsimKitCandidates(gcsim, KIT_TABLES, gcsim);
    const valuesAt = (path: string) => candidateMap.get(path)?.map(({ value }) => value);

    expect([
      valuesAt("stances.fieryPassion.skill.animationFrames"),
      valuesAt("stances.fieryPassion.skill.hits.0.hitmarkFrames"),
      valuesAt("stances.fieryPassion.skill.hits.0.multiplier"),
      valuesAt("burstVariant.animationFrames"),
      valuesAt("burstVariant.hits.0.hitmarkFrames"),
      valuesAt("burstVariant.hits.0.multiplier"),
    ]).toStrictEqual([
      [52],
      [2],
      [{ index: 0, proudSkillGroupId: 2 }],
      [122],
      [88],
      [{ index: 0, proudSkillGroupId: 1 }],
    ]);
  });

  test("gives a skill no hit from the queue call firing at its hold's hitmark, which is the hold's own", () => {
    expect.hasAssertions();

    const gcsim: GcsimCharacter = {
      animationFrameNameMap: new Map(),
      attacks: [
        {
          attackTag: "attacks.AttackTagElementalArtHold",
          element: "attributes.Geo",
          fieldLineMap: {},
          file: "skill.go",
          line: 4,
          siteLine: 4,
        },
      ],
      config: { abilityHitboxesMap: new Map(), names: [], talentVariables: [] },
      configFile: "config.yml",
      constantMap: new Map([
        ["skillHoldFrames", toConstant(96)],
        ["skillHoldHitmark", toConstant(48)],
        ["skillPressFrames", toConstant(38)],
      ]),
      filePaths: [],
      folder: "zhongli",
      goSources: [],
      holdCooldowns: [],
      queuedAttacks: [
        { attackLine: 4, attackName: undefined, delay: 48, delayLine: 5, file: "skill.go", lastLine: 5, line: 5 },
      ],
      talentArrayMap: new Map(),
      talentFile: "zhongli.go",
      talentParameterMap: new Map(),
      travelMap: new Map(),
    };
    const tables: KitTables = {
      characterId: 0,
      labelMap: new Map(),
      name: "Zhongli",
      talentGroupIdMap: {
        [CombatTalent.ElementalBurst]: 0,
        [CombatTalent.ElementalSkill]: 0,
        [CombatTalent.NormalAttack]: 0,
      },
      talentMultiplierMap: {},
      weaponType: WeaponType.Polearm,
    };
    const candidateMap = getGcsimKitCandidates(gcsim, tables, gcsim);

    expect(
      ["skill.hits.length", "skill.hits.0.hitmarkFrames", "skillHolds.0.action.hits.length"].map((path) =>
        candidateMap.get(path)?.map(({ value }) => value),
      ),
    ).toStrictEqual([undefined, undefined, [1]]);
  });

  test("gives a skill with no hold constant one hold, its hit the one call its hold parameter sets to 1 fires", () => {
    expect.hasAssertions();

    const gcsim: GcsimCharacter = {
      animationFrameNameMap: new Map(),
      attacks: [],
      config: { abilityHitboxesMap: new Map(), names: [], talentVariables: [] },
      configFile: "config.yml",
      constantMap: new Map([["skillPressFrames", toConstant(38)]]),
      filePaths: [],
      folder: "zhongli",
      goSources: [],
      holdCooldowns: [],
      queuedAttacks: [
        {
          attackLine: 4,
          attackName: undefined,
          delay: 48,
          delayLine: 5,
          file: "skill.go",
          holdValue: 1,
          lastLine: 5,
          line: 5,
        },
      ],
      talentArrayMap: new Map(),
      talentFile: "zhongli.go",
      talentParameterMap: new Map(),
      travelMap: new Map(),
    };
    const candidateMap = getGcsimKitCandidates(gcsim, KIT_TABLES, gcsim);

    expect(
      ["skillHolds.length", "skillHolds.0.action.hits.0.hitmarkFrames"].map((path) =>
        candidateMap.get(path)?.map(({ value }) => value),
      ),
    ).toStrictEqual([[1], [48]]);
  });
});
