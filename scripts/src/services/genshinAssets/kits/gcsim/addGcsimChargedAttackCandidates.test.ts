import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { GcsimTalentType } from "#src/models/genshinAssets/kits/gcsim/GcsimTalentType";
import {
  GCSIM_CHARGED_ATTACK_TAG,
  GCSIM_CONFIG_FILE,
  GCSIM_NO_INTERNAL_COOLDOWN_TAG,
} from "#src/services/genshinAssets/kits/constants";
import { addGcsimChargedAttackCandidates } from "#src/services/genshinAssets/kits/gcsim/addGcsimChargedAttackCandidates";
import { addGcsimChargedAttackVariantCandidates } from "#src/services/genshinAssets/kits/gcsim/addGcsimChargedAttackVariantCandidates";
import { createGcsimKitCandidateWriter } from "#src/services/genshinAssets/kits/gcsim/createGcsimKitCandidateWriter";
import { CombatTalent, WeaponType } from "genshin-world";
import { describe, expect, test } from "vitest";

describe(addGcsimChargedAttackCandidates, () => {
  // Iansan's charge.go: a charge hitmark constant, the charged attack, and the Stormflight `swift` attack fired by a
  // Queue call in the same file
  const gcsim: GcsimCharacter = {
    animationFrameNameMap: new Map(),
    attacks: [
      {
        abil: "Charged Attack",
        attackTag: GCSIM_CHARGED_ATTACK_TAG,
        durability: 25,
        element: "attributes.Physical",
        fieldLineMap: { Durability: 53, Element: 52 },
        file: "charge.go",
        internalCooldownTag: "attacks.ICDTagExtraAttack",
        line: 45,
        siteLine: 45,
        talentVariable: "charge",
        variableName: "ai",
      },
      {
        abil: "Swift Stormflight",
        attackTag: GCSIM_CHARGED_ATTACK_TAG,
        durability: 25,
        element: "attributes.Electro",
        fieldLineMap: { Durability: 92, Element: 91, PoiseDMG: 85 },
        file: "charge.go",
        internalCooldownTag: GCSIM_NO_INTERNAL_COOLDOWN_TAG,
        line: 81,
        poiseDamage: 120,
        siteLine: 81,
        talentVariable: "swift",
        variableName: "ai",
      },
    ],
    config: {
      abilityHitboxesMap: new Map(),
      names: [],
      talentVariables: [
        {
          leaves: [{ path: [], reference: { label: "Charged Attack DMG", selector: 0, type: GcsimTalentType.Attack } }],
          line: 1,
          name: "charge",
        },
        {
          leaves: [
            { path: [], reference: { label: "Swift Stormflight DMG", selector: 0, type: GcsimTalentType.Attack } },
          ],
          line: 2,
          name: "swift",
        },
      ],
    },
    configFile: GCSIM_CONFIG_FILE,
    constantMap: new Map([
      ["chargeHitmarks", { elementLines: {}, file: "charge.go", line: 19, value: [21] }],
      ["swiftFrames", { elementLines: {}, file: "charge.go", line: 31, value: { animationFrames: 33 } }],
    ]),
    filePaths: [],
    folder: "iansan",
    goSources: [],
    holdCooldowns: [],
    queuedAttacks: [{ attackName: "ai", delay: 25, delayLine: 101, file: "charge.go", lastLine: 97, line: 97 }],
    talentArrayMap: new Map(),
    talentFile: "iansan.go",
    talentParameterMap: new Map([
      ["attack|Charged Attack DMG", [{ index: 3, line: 4 }]],
      ["attack|Swift Stormflight DMG", [{ index: 4, line: 5 }]],
    ]),
    travelMap: new Map(),
  };

  const tables: KitTables = {
    characterId: 0,
    labelMap: new Map(),
    name: "Iansan",
    talentGroupIdMap: {
      [CombatTalent.ElementalBurst]: 0,
      [CombatTalent.ElementalSkill]: 0,
      [CombatTalent.NormalAttack]: 11031,
    },
    talentMultiplierMap: {},
    weaponType: WeaponType.Catalyst,
  };

  test("joins a charged attack variant's hit to the queue call that fires its attack, as a burst variant's kick joins", () => {
    expect.hasAssertions();

    const candidateMap = new Map<string, KitCandidate[]>();

    addGcsimChargedAttackCandidates(
      createGcsimKitCandidateWriter(candidateMap, gcsim, tables),
      gcsim,
      WeaponType.Catalyst,
    );
    addGcsimChargedAttackVariantCandidates(createGcsimKitCandidateWriter(candidateMap, gcsim, tables), gcsim);

    const valueOf = (path: string) => candidateMap.get(path)?.[0]?.value;
    expect(valueOf("chargedAttackVariant.hits.length")).toBe(1);
    expect(valueOf("chargedAttackVariant.animationFrames")).toBe(33);
    expect(valueOf("chargedAttackVariant.hits.0.hitmarkFrames")).toBe(25);
    expect(valueOf("chargedAttackVariant.hits.0.element")).toBe("Electric");
    expect(valueOf("chargedAttackVariant.hits.0.gauge")).toBe(1);
    expect(valueOf("chargedAttackVariant.hits.0.poiseDamage")).toBe(120);
    expect(valueOf("chargedAttackVariant.hits.0.multiplier")).toStrictEqual({ index: 4, proudSkillGroupId: 11031 });
  });

  test("a charged attack with no hitmark constant takes no queue call the variant claims, even where its own call has no delay", () => {
    expect.hasAssertions();
    const fallbackGcsim: GcsimCharacter = {
      ...gcsim,
      constantMap: new Map([...gcsim.constantMap].filter(([name]) => name !== "chargeHitmarks")),
      goSources: [],
      queuedAttacks: [
        { attackName: "ai", delayLine: 69, file: "charge.go", lastLine: 60, line: 60 },
        { attackName: "ai", delay: 25, delayLine: 101, file: "charge.go", lastLine: 97, line: 97 },
      ],
    };
    const candidateMap = new Map<string, KitCandidate[]>();

    addGcsimChargedAttackCandidates(
      createGcsimKitCandidateWriter(candidateMap, fallbackGcsim, tables),
      fallbackGcsim,
      WeaponType.Catalyst,
    );
    addGcsimChargedAttackVariantCandidates(
      createGcsimKitCandidateWriter(candidateMap, fallbackGcsim, tables),
      fallbackGcsim,
    );

    const valueOf = (path: string) => candidateMap.get(path)?.[0]?.value;
    expect(valueOf("chargedAttack.hits.length")).toBeUndefined();
    expect(valueOf("chargedAttackVariant.hits.0.hitmarkFrames")).toBe(25);
  });
});
