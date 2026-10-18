import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { GcsimHitboxCenter } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxCenter";
import { GcsimHitboxShape } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxShape";
import { addGcsimGravityRippleCandidates } from "#src/services/genshinAssets/kits/gcsim/addGcsimGravityRippleCandidates";
import { createGcsimKitCandidateWriter } from "#src/services/genshinAssets/kits/gcsim/createGcsimKitCandidateWriter";
import { CombatTalent, STRIKE_TARGETING_AREA, WeaponType } from "genshin-world";
import { describe, expect, test } from "vitest";

// Columbina's gravity ripples as skill.go and config.yml name them: each reaction's hitmark constant, the bloom's travel,
// And the config's `E-Gravity-*` hitbox round the primary target, a circle of the radius its name is given
const gcsim: GcsimCharacter = {
  animationFrameNameMap: new Map(),
  attacks: [],
  config: {
    abilityHitboxesMap: new Map([
      [
        "skill",
        [
          {
            center: GcsimHitboxCenter.PrimaryTarget,
            file: "config.yml",
            line: 60,
            name: "E-Gravity-LC",
            radius: 6,
            shape: GcsimHitboxShape.Circle,
          },
          {
            center: GcsimHitboxCenter.PrimaryTarget,
            file: "config.yml",
            line: 63,
            name: "E-Gravity-LB",
            radius: 0.5,
            shape: GcsimHitboxShape.Circle,
          },
          {
            center: GcsimHitboxCenter.PrimaryTarget,
            file: "config.yml",
            line: 66,
            name: "E-Gravity-LCr",
            radius: 6,
            shape: GcsimHitboxShape.Circle,
          },
        ],
      ],
    ]),
    names: ["columbina"],
    talentVariables: [],
  },
  configFile: "config.yml",
  constantMap: new Map([
    ["skillHitmarksLC", { elementLines: {}, file: "skill.go", line: 19, value: 43 }],
    ["skillHitmarksLCr", { elementLines: {}, file: "skill.go", line: 18, value: 43 }],
    ["skillHitmarksLB", { elementLines: {}, file: "skill.go", line: 20, value: [51, 56, 62, 71, 82] }],
    ["skillLBTravel", { elementLines: {}, file: "skill.go", line: 30, value: 20 }],
  ]),
  filePaths: [],
  folder: "columbina",
  gravityRipples: [
    {
      abil: "Gravity Interference (Lunar-Charged)",
      element: "attributes.Electro",
      file: "skill.go",
      hitmarkName: "skillHitmarksLC",
      line: 24,
      reaction: "LunarCharge",
      talentVariable: "skillLC",
    },
    {
      abil: "Gravity Interference (Lunar-Bloom)",
      element: "attributes.Dendro",
      file: "skill.go",
      hitmarkName: "skillHitmarksLB",
      line: 28,
      reaction: "LunarBloom",
      talentVariable: "skillLB",
      travelName: "skillLBTravel",
    },
    {
      abil: "Gravity Interference (Lunar-Crystallize)",
      element: "attributes.Geo",
      file: "skill.go",
      hitmarkName: "skillHitmarksLCr",
      line: 34,
      reaction: "LunarCrystallize",
      talentVariable: "skillLCr",
    },
  ],
  holdCooldowns: [],
  queuedAttacks: [],
  talentArrayMap: new Map(),
  talentFile: "columbina.go",
  talentParameterMap: new Map(),
  travelMap: new Map(),
};

const tables: KitTables = {
  characterId: 0,
  labelMap: new Map(),
  name: "Columbina",
  talentGroupIdMap: {
    [CombatTalent.ElementalBurst]: 0,
    [CombatTalent.ElementalSkill]: 0,
    [CombatTalent.NormalAttack]: 0,
  },
  talentMultiplierMap: {},
  weaponType: WeaponType.Catalyst,
};

describe(addGcsimGravityRippleCandidates, () => {
  test("writes each reaction's ripple hit at its hitmarks, the bloom's travel added and its hits listed, on the circle its config names", () => {
    expect.hasAssertions();

    const candidateMap = new Map<string, KitCandidate[]>();

    addGcsimGravityRippleCandidates(createGcsimKitCandidateWriter(candidateMap, gcsim, tables), gcsim);

    const valueOf = (path: string) => candidateMap.get(path)?.[0]?.value;
    expect(valueOf("hits.gravityRippleLunarCharged.hitmarkFrames")).toBe(43);
    expect(valueOf("hits.gravityRippleLunarCharged.element")).toBe("Electric");
    expect(valueOf("hits.gravityRippleLunarCharged.poiseDamage")).toBe(0);
    expect(valueOf("hits.gravityRippleLunarCharged.area")).toStrictEqual({
      angle: 2 * Math.PI,
      height: 2,
      radius: STRIKE_TARGETING_AREA.radius + 6,
    });
    expect(valueOf("hits.gravityRippleLunarCrystallize.hitmarkFrames")).toBe(43);
    expect(valueOf("hits.gravityRippleLunarBloom.length")).toBe(5);
    expect(valueOf("hits.gravityRippleLunarBloom.0.hitmarkFrames")).toBe(71);
    expect(valueOf("hits.gravityRippleLunarBloom.4.hitmarkFrames")).toBe(102);
    expect(valueOf("hits.gravityRippleLunarBloom.0.area")).toStrictEqual({
      angle: 2 * Math.PI,
      height: 2,
      radius: STRIKE_TARGETING_AREA.radius + 0.5,
    });
  });
});
