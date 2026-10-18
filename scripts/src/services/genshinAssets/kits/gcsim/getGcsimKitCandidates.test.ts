import type { GcsimAttack } from "#src/models/genshinAssets/kits/gcsim/GcsimAttack";
import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GcsimTalentParameter } from "#src/models/genshinAssets/kits/gcsim/GcsimTalentParameter";
import type { GcsimTalentVariable } from "#src/models/genshinAssets/kits/gcsim/GcsimTalentVariable";
import type { GoConstant } from "#src/models/genshinAssets/kits/gcsim/GoConstant";
import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { GcsimHitboxCenter } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxCenter";
import { GcsimHitboxShape } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxShape";
import { GcsimTalentType } from "#src/models/genshinAssets/kits/gcsim/GcsimTalentType";
import { KitProvisionalCause } from "#src/models/genshinAssets/kits/KitProvisionalCause";
import { createBoxReach } from "#src/services/genshinAssets/kits/gcsim/createBoxReach";
import { getGcsimKitCandidates } from "#src/services/genshinAssets/kits/gcsim/getGcsimKitCandidates";
import { CombatTalent, Element, InternalCooldownTag, WeaponType } from "genshin-world";
import { describe, expect, test } from "vitest";

const toConstant = (value: GoValue) => ({ elementLines: {}, file: "skill.go", line: 1, value });
const plungeConstant = (value: GoValue, line: number) => ({ elementLines: {}, file: "plunge.go", line, value });
const frames = (animationFrames: number) => ({ animationFrames, hitmarkFrames: 0 });

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
    talentParameters?: [string, GcsimTalentParameter][];
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
  queuedAttacks: [],
  talentFile: `${folder}.go`,
  talentParameterMap: new Map(talentParameters),
  travelMap: new Map(),
});

describe(getGcsimKitCandidates, () => {
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
      queuedAttacks: [],
      talentFile: "razor.go",
      talentParameterMap: new Map(),
      holdCooldowns: [],
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
      queuedAttacks: [],
      talentFile: "razor.go",
      talentParameterMap: new Map(),
      holdCooldowns: [],
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
      queuedAttacks: [],
      talentFile: "itto.go",
      talentParameterMap: new Map(),
      holdCooldowns: [],
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
      queuedAttacks: [{ attackName: "ai", delay: 55, delayLine: 7, file: "burst.go", line: 7 }],
      talentFile: "zz_jean.go",
      talentParameterMap: new Map(),
      holdCooldowns: [],
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
      queuedAttacks: [
        { attackName: "ai", delay: 32, delayLine: 67, file: "burst.go", line: 67 },
        { attackName: "ai", delay: 1, delayLine: 110, file: "burst.go", line: 110 },
      ],
      talentFile: "zz_razor.go",
      talentParameterMap: new Map([["burst|Burst DMG", { indexes: [3], line: 40 }]]),
      holdCooldowns: [],
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
      queuedAttacks: [],
      talentFile: "mona.go",
      talentParameterMap: new Map(),
      holdCooldowns: [],
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
      queuedAttacks: [],
      talentFile: "navia.go",
      talentParameterMap: new Map(),
      holdCooldowns: [],
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
      queuedAttacks: [],
      talentFile: "barbara.go",
      talentParameterMap: new Map(),
      holdCooldowns: [],
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
      queuedAttacks: [],
      talentFile: "aino.go",
      talentParameterMap: new Map(),
      holdCooldowns: [],
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
      queuedAttacks: [],
      talentFile: "aino.go",
      talentParameterMap: new Map(),
      holdCooldowns: [],
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
      queuedAttacks: [
        { attackLine: undefined, attackName: undefined, delay: 60, delayLine: 4, file: "skill.go", hitbox, line: 4 },
        { attackLine: undefined, attackName: "hit", delay: 60, delayLine: 5, file: "skill.go", hitbox, line: 5 },
      ],
      talentFile: "razor.go",
      talentParameterMap: new Map(),
      holdCooldowns: [],
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
      talentParameters: [["attack|Blade Roller 2-Hit DMG", { indexes: [1], line: 10 }]],
      talentVariables: [
        {
          leaves: [0, 1, 2, 3].map((index) => ({
            path: [index],
            reference: { label: `Blade Roller ${index + 1}-Hit DMG`, selector: 0, type: "attack" },
          })),
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
});
