import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { GcsimHitboxCenter } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxCenter";
import { GcsimHitboxShape } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxShape";
import { GcsimTalentType } from "#src/models/genshinAssets/kits/gcsim/GcsimTalentType";
import { GCSIM_CONFIG_FILE, GCSIM_NO_INTERNAL_COOLDOWN_TAG } from "#src/services/genshinAssets/kits/constants";
import { addGcsimMoondewCleanseCandidates } from "#src/services/genshinAssets/kits/gcsim/addGcsimMoondewCleanseCandidates";
import { createGcsimKitCandidateWriter } from "#src/services/genshinAssets/kits/gcsim/createGcsimKitCandidateWriter";
import { createTargetedHitArea } from "#src/services/genshinAssets/kits/gcsim/createTargetedHitArea";
import { CombatTalent, Element, LunarReactionType, STRIKE_TARGETING_AREA, WeaponType } from "genshin-world";
import { describe, expect, test } from "vitest";

// Columbina's charge.go: the Moondew Cleanse's three hitmarks, its frames, and its Lunar-Bloom attack, whose hitbox the
// Config gives on the primary target
const createGcsim = (withMoondewCleanse: boolean): GcsimCharacter => ({
  animationFrameNameMap: new Map(),
  attacks: withMoondewCleanse
    ? [
        {
          abil: "Moondew Cleanse",
          attackTag: "attacks.AttackTagDirectLunarBloom",
          element: "attributes.Dendro",
          fieldLineMap: { AttackTag: 94, Element: 98 },
          file: "charge.go",
          internalCooldownTag: GCSIM_NO_INTERNAL_COOLDOWN_TAG,
          line: 94,
          siteLine: 82,
          talentVariable: "chargeLB",
          variableName: "ai",
        },
      ]
    : [],
  config: {
    abilityHitboxesMap: new Map([
      [
        "charge",
        [
          {
            center: GcsimHitboxCenter.PrimaryTarget,
            line: 16,
            name: "CA-Moondew-Cleanse",
            radius: 3.3,
            shape: GcsimHitboxShape.Circle,
          },
        ],
      ],
    ]),
    names: [],
    talentVariables: [
      {
        leaves: [{ path: [], reference: { label: "Moondew Cleanse DMG", selector: 0, type: GcsimTalentType.Attack } }],
        line: 1,
        name: "chargeLB",
      },
    ],
  },
  configFile: GCSIM_CONFIG_FILE,
  constantMap: new Map([
    ["chargeHitmarkBloom", { elementLines: {}, file: "charge.go", line: 15, value: [50, 58, 80] }],
    ["chargeLBFrames", { elementLines: {}, file: "charge.go", line: 35, value: { animationFrames: 124 } }],
  ]),
  filePaths: [],
  folder: "columbina",
  goSources: [],
  holdCooldowns: [],
  queuedAttacks: [],
  talentArrayMap: new Map(),
  talentFile: "columbina.go",
  talentParameterMap: new Map([["attack|Moondew Cleanse DMG", [{ index: 3, line: 4 }]]]),
  travelMap: new Map(),
});

describe(addGcsimMoondewCleanseCandidates, () => {
  const tables: KitTables = {
    characterId: 0,
    labelMap: new Map(),
    name: "Columbina",
    talentGroupIdMap: {
      [CombatTalent.ElementalBurst]: 0,
      [CombatTalent.ElementalSkill]: 0,
      [CombatTalent.NormalAttack]: 11031,
    },
    talentMultiplierMap: {},
    weaponType: WeaponType.Catalyst,
  };

  test("gives the Moondew Cleanse's three Lunar-Bloom hits their hitmarks, frames, element, multiplier and primary target's circle", () => {
    expect.hasAssertions();

    const gcsim = createGcsim(true);
    const candidateMap = new Map<string, KitCandidate[]>();

    addGcsimMoondewCleanseCandidates(createGcsimKitCandidateWriter(candidateMap, gcsim, tables), gcsim);

    const valuesAt = (path: string) => candidateMap.get(path)?.map(({ value }) => value);
    expect(valuesAt("chargedAttackVariant.hits.length")).toStrictEqual([3]);
    expect(valuesAt("chargedAttackVariant.animationFrames")).toStrictEqual([124]);
    expect(valuesAt("chargedAttackVariant.hits.0.hitmarkFrames")).toStrictEqual([50]);
    expect(valuesAt("chargedAttackVariant.hits.1.hitmarkFrames")).toStrictEqual([58]);
    expect(valuesAt("chargedAttackVariant.hits.2.hitmarkFrames")).toStrictEqual([80]);
    expect(valuesAt("chargedAttackVariant.hits.0.element")).toStrictEqual([Element.Dendro]);
    expect(valuesAt("chargedAttackVariant.hits.0.lunarReactionType")).toStrictEqual([LunarReactionType.LunarBloom]);
    expect(valuesAt("chargedAttackVariant.hits.2.area")).toStrictEqual([
      createTargetedHitArea(STRIKE_TARGETING_AREA, 3.3),
    ]);
    expect(valuesAt("chargedAttackVariant.hits.0.multiplier")).toStrictEqual([{ index: 3, proudSkillGroupId: 11031 }]);
  });

  test("gives no variant when Columbina's config names no Moondew Cleanse attack", () => {
    expect.hasAssertions();

    const gcsim = createGcsim(false);
    const candidateMap = new Map<string, KitCandidate[]>();

    addGcsimMoondewCleanseCandidates(createGcsimKitCandidateWriter(candidateMap, gcsim, tables), gcsim);

    expect(candidateMap.size).toBe(0);
  });
});
