import type { ArtifactRarityData } from "#src/models/artifact/ArtifactRarityData";
import type { CharacterData } from "#src/models/character/CharacterData";
import type { Trial } from "#src/models/trial/Trial";
import type { TrialBuild } from "#src/models/trial/TrialBuild";
import type { TrialReliquary } from "#src/models/trial/TrialReliquary";
import type { TrialTemplate } from "#src/models/trial/TrialTemplate";
import type { WeaponData } from "#src/models/weapon/WeaponData";
import type { Except } from "type-fest";

import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { Attribute } from "#src/models/character/Attribute";
import { CombatTalent } from "#src/models/character/CombatTalent";
import { createTrialCharacter } from "#src/services/trial/createTrialCharacter";
import { describe, expect, test } from "vitest";

const CHARACTER_ID = 1001;
const WEAPON_ID = 2001;
const TRIAL: Trial = { characterId: CHARACTER_ID, level: 85, trialId: 3001 };
const PHASE_CAPS = [20, 40, 50, 60, 70, 80, 90];
const PHASES = PHASE_CAPS.map((maxLevel) => ({
  attributeLines: [],
  coinCost: 0,
  costItems: [],
  maxLevel,
  requiredPlayerLevel: 0,
}));
const CHARACTER_DATA_MAP = new Map<number, Pick<CharacterData, "ascensionPhases">>([
  [CHARACTER_ID, { ascensionPhases: PHASES }],
]);
const WEAPON_DATA_MAP = new Map<number, Pick<WeaponData, "ascensionPhases">>([
  [WEAPON_ID, { ascensionPhases: PHASES }],
]);
// A reliquary at level 4 has the cost of levels 0 to 3 behind it: 10 + 20 + 30 + 40
const ARTIFACT_RARITY_DATA: ArtifactRarityData = {
  affixLevels: [],
  baseExperience: 0,
  levelExperiences: [10, 20, 30, 40, 50],
  maxLevel: 5,
  minorAffixGroups: [],
  rarity: 4,
};
const ARTIFACT_RARITY_DATA_MAP = new Map([[4, ARTIFACT_RARITY_DATA]]);
const RELIQUARY: Except<TrialReliquary, "id"> = {
  level: 4,
  mainAffix: Attribute.AttackPercent,
  minorAffixes: [{ attribute: Attribute.Attack, value: 4.67 }],
  rarity: 4,
  setId: 9001,
  slot: ArtifactSlot.FlowerOfLife,
};
const RELIQUARIES: Record<string, TrialReliquary> = {
  91: { ...RELIQUARY, id: 91 },
  92: { ...RELIQUARY, id: 92, slot: ArtifactSlot.PlumeOfDeath },
};
const TEMPLATES: TrialTemplate[] = [
  { level: 1, reliquaryIds: [1], talentLevel: 1 },
  { level: 85, reliquaryIds: [91, 92, 94], talentLevel: 8 },
];
const BUILDS: Record<string, TrialBuild> = {
  [CHARACTER_ID]: { characterId: CHARACTER_ID, constellation: 0, refinement: 3, weaponId: WEAPON_ID },
};
const TABLES = { builds: BUILDS, reliquaries: RELIQUARIES, templates: TEMPLATES };
const DATA = {
  artifactRarityDataMap: ARTIFACT_RARITY_DATA_MAP,
  characterDataMap: CHARACTER_DATA_MAP,
  weaponDataMap: WEAPON_DATA_MAP,
};

describe(createTrialCharacter, () => {
  test("a trial party member is at the trial's level with its artifacts", () => {
    expect.hasAssertions();
    expect(createTrialCharacter(TRIAL, TABLES, DATA)).toStrictEqual({
      artifacts: [
        {
          experience: 100,
          isLocked: false,
          level: 4,
          mainAffix: Attribute.AttackPercent,
          minorAffixes: [{ attribute: Attribute.Attack, value: 4.67 }],
          rarity: 4,
          setId: 9001,
          slot: ArtifactSlot.FlowerOfLife,
        },
        {
          experience: 100,
          isLocked: false,
          level: 4,
          mainAffix: Attribute.AttackPercent,
          minorAffixes: [{ attribute: Attribute.Attack, value: 4.67 }],
          rarity: 4,
          setId: 9001,
          slot: ArtifactSlot.PlumeOfDeath,
        },
      ],
      ascension: 6,
      constellationCount: 0,
      friendshipExp: 0,
      id: CHARACTER_ID,
      level: 85,
      stellaFortunaCount: 0,
      talentLevels: {
        [CombatTalent.ElementalBurst]: 8,
        [CombatTalent.ElementalSkill]: 8,
        [CombatTalent.NormalAttack]: 8,
      },
      weapon: { ascension: 6, experience: 0, id: WEAPON_ID, level: 90, refinement: 3 },
    });
  });

  test("a trial whose character has no cited build has no party member", () => {
    expect.hasAssertions();
    expect(createTrialCharacter(TRIAL, { ...TABLES, builds: {} }, DATA)).toBeUndefined();
  });
});
