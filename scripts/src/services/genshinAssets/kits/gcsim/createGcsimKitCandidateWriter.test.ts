import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { GCSIM_CONFIG_FILE, GCSIM_NO_INTERNAL_COOLDOWN_TAG } from "#src/services/genshinAssets/kits/constants";
import { createGcsimKitCandidateWriter } from "#src/services/genshinAssets/kits/gcsim/createGcsimKitCandidateWriter";
import { CombatTalent, SKILL_TARGETING_AREA, WeaponType } from "genshin-world";
import { describe, expect, test } from "vitest";

describe(createGcsimKitCandidateWriter, () => {
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
  const GCSIM_CHARACTER: GcsimCharacter = {
    animationFrameNameMap: new Map(),
    attacks: [],
    config: { abilityHitboxesMap: new Map(), names: [], talentVariables: [] },
    configFile: GCSIM_CONFIG_FILE,
    constantMap: new Map(),
    filePaths: [],
    folder: "heizou",
    goSources: [],
    holdCooldowns: [],
    queuedAttacks: [],
    talentArrayMap: new Map(),
    talentFile: "heizou.go",
    talentParameterMap: new Map(),
    travelMap: new Map(),
  };

  test("writes a NoElement hit with no element and no gauge, though the hit gives a durability", () => {
    expect.hasAssertions();

    const candidateMap = new Map<string, KitCandidate[]>();
    const { addHit } = createGcsimKitCandidateWriter(candidateMap, GCSIM_CHARACTER, KIT_TABLES);
    addHit(
      "hits.iris",
      {
        attack: {
          attackTag: "attacks.AttackTagElementalBurst",
          durability: 25,
          element: "attributes.NoElement",
          fieldLineMap: { Durability: 4, Element: 3 },
          file: "burst.go",
          internalCooldownTag: GCSIM_NO_INTERNAL_COOLDOWN_TAG,
          line: 2,
          siteLine: 2,
        },
      },
      SKILL_TARGETING_AREA,
    );

    expect([
      candidateMap.get("hits.iris.element")?.map(({ value }) => value),
      candidateMap.get("hits.iris.gauge")?.map(({ value }) => value),
    ]).toStrictEqual([[undefined], [undefined]]);
  });
});
