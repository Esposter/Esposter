import type { Character } from "#src/models/character/Character";
import type { CharacterData } from "#src/models/character/CharacterData";

import { TALENT_START_LEVELS } from "#src/services/character/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A character as the game gives one: at level 1 in its first phase, every combat talent at its first level, wielding the
// Weapon it comes with at the weapon's level 1, wearing no artifacts, with no constellation active or Stella Fortuna, and
// With no Companionship EXP toward its Friendship Level
export const createCharacter = (id: number, characterDataMap: ReadonlyMap<number, CharacterData>): Character => {
  const characterData = characterDataMap.get(id);
  if (!characterData) throw new InvalidOperationError(Operation.Create, createCharacter.name, `character ${id}`);
  return {
    artifacts: [],
    ascension: 0,
    constellationCount: 0,
    friendshipExp: 0,
    id,
    level: 1,
    stellaFortunaCount: 0,
    talentLevels: { ...TALENT_START_LEVELS },
    weapon: { ascension: 0, experience: 0, id: characterData.initialWeaponId, level: 1, refinement: 1 },
  };
};
