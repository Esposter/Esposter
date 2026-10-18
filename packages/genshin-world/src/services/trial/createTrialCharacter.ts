import type { Artifact } from "#src/models/artifact/Artifact";
import type { ArtifactRarityData } from "#src/models/artifact/ArtifactRarityData";
import type { Character } from "#src/models/character/Character";
import type { CharacterData } from "#src/models/character/CharacterData";
import type { Trial } from "#src/models/trial/Trial";
import type { TrialReliquary } from "#src/models/trial/TrialReliquary";
import type { WeaponData } from "#src/models/weapon/WeaponData";
import type { CharacterTrialTables } from "#src/services/trial/readCharacterTrials";

import { CombatTalent } from "#src/models/character/CombatTalent";
import { getArtifactRarityData } from "#src/services/artifact/getArtifactRarityData";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { findTrialTemplate } from "#src/services/trial/findTrialTemplate";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The level the trial's weapon is held at: the wiki's Character Trial builds are level-ninety blocks
const TRIAL_WEAPON_LEVEL = 90;

// The party member a trial fights with: its character at the trial's level, every combat talent at its template's talent
// Level, the reliquaries its template names as the artifacts it wears, and the weapon its wiki build holds at level ninety.
// None when no build is cited for the character, since a party member holds a weapon and there is none to give it
export const createTrialCharacter = (
  trial: Trial,
  { builds, reliquaries, templates }: Pick<CharacterTrialTables, "builds" | "reliquaries" | "templates">,
  {
    artifactRarityDataMap,
    characterDataMap,
    weaponDataMap,
  }: {
    artifactRarityDataMap: ReadonlyMap<number, ArtifactRarityData>;
    characterDataMap: ReadonlyMap<number, Pick<CharacterData, "ascensionPhases">>;
    weaponDataMap: ReadonlyMap<number, Pick<WeaponData, "ascensionPhases">>;
  },
): Character | undefined => {
  const build = builds[trial.characterId];
  if (!build) return undefined;
  const characterData = characterDataMap.get(trial.characterId);
  if (!characterData)
    throw new InvalidOperationError(Operation.Create, createTrialCharacter.name, `character ${trial.characterId}`);
  const weaponData = weaponDataMap.get(build.weaponId);
  if (!weaponData)
    throw new InvalidOperationError(Operation.Create, createTrialCharacter.name, `weapon ${build.weaponId}`);
  const template = findTrialTemplate(templates, trial.level);
  const talentLevel = template?.talentLevel ?? TALENT_START_LEVEL;
  const artifacts = (template?.reliquaryIds ?? []).flatMap((reliquaryId) => {
    const reliquary = reliquaries[reliquaryId];
    return reliquary ? [toTrialArtifact(reliquary, artifactRarityDataMap)] : [];
  });
  return {
    artifacts,
    ascension: getAscensionOf(characterData.ascensionPhases, trial.level),
    constellationCount: build.constellation,
    friendshipExp: 0,
    id: trial.characterId,
    level: trial.level,
    stellaFortunaCount: 0,
    talentLevels: {
      [CombatTalent.ElementalBurst]: talentLevel,
      [CombatTalent.ElementalSkill]: talentLevel,
      [CombatTalent.NormalAttack]: talentLevel,
    },
    weapon: {
      ascension: getAscensionOf(weaponData.ascensionPhases, TRIAL_WEAPON_LEVEL),
      experience: 0,
      id: build.weaponId,
      level: TRIAL_WEAPON_LEVEL,
      refinement: build.refinement,
    },
  };
};

// The first phase whose level cap reaches the level, which is the ascension a level is only reached at
const getAscensionOf = (phases: readonly { maxLevel: number }[], level: number): number => {
  const ascension = phases.findIndex((phase) => phase.maxLevel >= level);
  if (ascension === -1) throw new InvalidOperationError(Operation.Create, createTrialCharacter.name, `level ${level}`);
  return ascension;
};

// A trial's reliquary as the artifact it is worn as: unlocked, with the EXP its level has cost to reach
const toTrialArtifact = (
  reliquary: TrialReliquary,
  artifactRarityDataMap: ReadonlyMap<number, ArtifactRarityData>,
): Artifact => {
  const { levelExperiences } = getArtifactRarityData(artifactRarityDataMap, reliquary.rarity);
  return {
    experience: levelExperiences.slice(0, reliquary.level).reduce((total, cost) => total + cost, 0),
    isLocked: false,
    level: reliquary.level,
    mainAffix: reliquary.mainAffix,
    minorAffixes: reliquary.minorAffixes,
    rarity: reliquary.rarity,
    setId: reliquary.setId,
    slot: reliquary.slot,
  };
};
