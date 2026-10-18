import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { GcsimTalentType } from "#src/models/genshinAssets/kits/gcsim/GcsimTalentType";
import { addGcsimSkillAndBurstCandidates } from "#src/services/genshinAssets/kits/gcsim/addGcsimSkillAndBurstCandidates";
import { createGcsimKitCandidateWriter } from "#src/services/genshinAssets/kits/gcsim/createGcsimKitCandidateWriter";
import { CombatTalent, Element, WeaponType } from "genshin-world";
import { describe, expect, test } from "vitest";

// Wriothesley's burst.go: one wolfbite hitmark, and Surging Blade queued past it by a call in a task that runs at 160
// Frames. The attack pair is fixed by the fixture, so the test reads no game data
const createGcsim = (folder: string): GcsimCharacter => ({
  animationFrameNameMap: new Map(),
  attacks: [
    {
      abil: "Darkgold Wolfbite",
      attackTag: "attacks.AttackTagElementalBurst",
      durability: 25,
      element: "attributes.Cryo",
      fieldLineMap: { Durability: 30, Element: 29 },
      file: "burst.go",
      line: 30,
      siteLine: 30,
      talentVariable: "burstWolfbite",
      variableName: "ai",
    },
    {
      abil: "Surging Blade",
      attackTag: "attacks.AttackTagElementalBurst",
      durability: 0,
      element: "attributes.Cryo",
      fieldLineMap: { Durability: 62, Element: 61 },
      file: "burst.go",
      line: 60,
      siteLine: 60,
      talentVariable: "burstOusia",
      variableName: "aiOusia",
    },
  ],
  config: {
    abilityHitboxesMap: new Map(),
    names: [],
    talentVariables: [
      {
        leaves: [{ path: [], reference: { label: "Darkgold Wolfbite DMG", selector: 0, type: GcsimTalentType.Burst } }],
        line: 1,
        name: "burstWolfbite",
      },
      {
        leaves: [{ path: [], reference: { label: "Surging Blade DMG", selector: 0, type: GcsimTalentType.Burst } }],
        line: 2,
        name: "burstOusia",
      },
    ],
  },
  configFile: "config.yml",
  constantMap: new Map([["burstHitmarks", { elementLines: {}, file: "burst.go", line: 14, value: [99] }]]),
  filePaths: [],
  folder,
  holdCooldowns: [],
  queuedAttacks: [{ attackName: "aiOusia", delay: 160, delayLine: 72, file: "burst.go", line: 66 }],
  talentArrayMap: new Map(),
  talentFile: "wriothesley.go",
  talentParameterMap: new Map([
    ["burst|Darkgold Wolfbite DMG", { indexes: [3], line: 4 }],
    ["burst|Surging Blade DMG", { indexes: [4], line: 5 }],
  ]),
  travelMap: new Map(),
});

const tables: KitTables = {
  characterId: 0,
  labelMap: new Map(),
  name: "Wriothesley",
  talentGroupIdMap: {
    [CombatTalent.ElementalBurst]: 11001,
    [CombatTalent.ElementalSkill]: 0,
    [CombatTalent.NormalAttack]: 0,
  },
  talentMultiplierMap: {},
  weaponType: WeaponType.Sword,
};

const buildCandidates = (gcsim: GcsimCharacter): Map<string, KitCandidate[]> => {
  const candidateMap = new Map<string, KitCandidate[]>();
  addGcsimSkillAndBurstCandidates(createGcsimKitCandidateWriter(candidateMap, gcsim, tables), gcsim);
  return candidateMap;
};

describe(addGcsimSkillAndBurstCandidates, () => {
  test("adds a queued burst hit past the hitmarks as the burst's last hit, at its queue call's delay and multiplier", () => {
    expect.hasAssertions();
    const candidateMap = buildCandidates(createGcsim("/characters/wriothesley"));
    const valueOf = (path: string) => candidateMap.get(path)?.[0]?.value;

    expect(valueOf("burst.hits.length")).toBe(2);
    expect(valueOf("burst.hits.1.hitmarkFrames")).toBe(160);
    expect(valueOf("burst.hits.1.element")).toBe(Element.Cryo);
    expect(valueOf("burst.hits.1.multiplier")).toStrictEqual({ index: 4, proudSkillGroupId: 11001 });
  });

  test("adds no queued burst hit to a character with no queued burst ability", () => {
    expect.hasAssertions();
    const candidateMap = buildCandidates(createGcsim("/characters/iansan"));
    const valueOf = (path: string) => candidateMap.get(path)?.[0]?.value;

    expect(valueOf("burst.hits.length")).toBe(1);
    expect(valueOf("burst.hits.1.hitmarkFrames")).toBeUndefined();
  });
});
