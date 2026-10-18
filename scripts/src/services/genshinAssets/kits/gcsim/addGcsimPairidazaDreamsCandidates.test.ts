import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { GcsimHitboxCenter } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxCenter";
import { GcsimHitboxShape } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxShape";
import { addGcsimPairidazaDreamsCandidates } from "#src/services/genshinAssets/kits/gcsim/addGcsimPairidazaDreamsCandidates";
import { createGcsimKitCandidateWriter } from "#src/services/genshinAssets/kits/gcsim/createGcsimKitCandidateWriter";
import { CombatTalent, STRIKE_TARGETING_AREA, WeaponType } from "genshin-world";
import { describe, expect, test } from "vitest";

// Kaveh's cons.go: the Constellation 6 literal, whose Mult is a number, and the queue call that fires it on a circle of
// Radius 4 round the target, 18 frames after the hit
const gcsim: GcsimCharacter = {
  animationFrameNameMap: new Map(),
  attacks: [
    {
      abil: "Pairidaeza's Dreams (C6)",
      attackTag: "attacks.AttackTagNone",
      durability: 25,
      element: "attributes.Dendro",
      fieldLineMap: { Durability: 62, Element: 61, Mult: 63 },
      file: "cons.go",
      line: 58,
      mult: 0.618,
      siteLine: 58,
      variableName: "ai",
    },
  ],
  config: { abilityHitboxesMap: new Map(), names: [], talentVariables: [] },
  configFile: "config.yml",
  constantMap: new Map(),
  filePaths: [],
  folder: "kaveh",
  holdCooldowns: [],
  queuedAttacks: [
    {
      attackName: "ai",
      delay: 18,
      delayLine: 73,
      file: "cons.go",
      line: 74,
      struckEnemyHitbox: {
        center: GcsimHitboxCenter.PrimaryTarget,
        file: "cons.go",
        line: 72,
        name: "NewCircleHitOnTarget",
        radius: 4,
        shape: GcsimHitboxShape.Circle,
      },
    },
  ],
  talentArrayMap: new Map(),
  talentFile: "kaveh.go",
  talentParameterMap: new Map(),
  travelMap: new Map(),
};

const tables: KitTables = {
  characterId: 0,
  labelMap: new Map(),
  name: "Kaveh",
  talentGroupIdMap: {
    [CombatTalent.ElementalBurst]: 0,
    [CombatTalent.ElementalSkill]: 0,
    [CombatTalent.NormalAttack]: 0,
  },
  talentMultiplierMap: {},
  weaponType: WeaponType.Claymore,
};

describe(addGcsimPairidazaDreamsCandidates, () => {
  test("writes Pairidaeza's Dreams' hit from its Constellation 6 literal and the queue call that fires it", () => {
    expect.hasAssertions();

    const candidateMap = new Map<string, KitCandidate[]>();

    addGcsimPairidazaDreamsCandidates(createGcsimKitCandidateWriter(candidateMap, gcsim, tables), gcsim);

    const valueOf = (path: string) => candidateMap.get(path)?.[0]?.value;
    expect(valueOf("hits.pairidazaDreams.multiplier")).toBe(0.618);
    expect(valueOf("hits.pairidazaDreams.hitmarkFrames")).toBe(18);
    expect(valueOf("hits.pairidazaDreams.element")).toBe("Grass");
    expect(valueOf("hits.pairidazaDreams.gauge")).toBe(1);
    expect(valueOf("hits.pairidazaDreams.poiseDamage")).toBe(0);
    expect(valueOf("hits.pairidazaDreams.area")).toStrictEqual({
      angle: 2 * Math.PI,
      height: 2,
      radius: STRIKE_TARGETING_AREA.radius + 4,
    });
  });
});
