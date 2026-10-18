import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { GcsimHitboxCenter } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxCenter";
import { GcsimHitboxShape } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxShape";
import { KitProvisionalCause } from "#src/models/genshinAssets/kits/KitProvisionalCause";
import { getGcsimKitCandidates } from "#src/services/genshinAssets/kits/gcsim/getGcsimKitCandidates";
import { CombatTalent, WeaponType } from "genshin-world";
import { describe, expect, test } from "vitest";

const toConstant = (value: GoValue) => ({ elementLines: {}, file: "skill.go", line: 1, value });
const plungeConstant = (value: GoValue, line: number) => ({ elementLines: {}, file: "plunge.go", line, value });
const frames = (animationFrames: number) => ({ animationFrames, hitmarkFrames: 0 });

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
});
