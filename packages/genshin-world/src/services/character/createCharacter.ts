import type { Character } from "#src/models/character/Character";
import type { CharacterData } from "#src/models/character/CharacterData";

import { InvalidOperationError, Operation } from "@esposter/shared";

// A character as the game gives one: at level 1 in its first phase, wielding the weapon it comes with at the weapon's
// Level 1, and wearing no artifacts
export const createCharacter = (id: number, characterDataMap: ReadonlyMap<number, CharacterData>): Character => {
  const characterData = characterDataMap.get(id);
  if (!characterData) throw new InvalidOperationError(Operation.Create, createCharacter.name, `character ${id}`);
  return {
    artifacts: [],
    ascension: 0,
    id,
    level: 1,
    weapon: { ascension: 0, id: characterData.initialWeaponId, level: 1 },
  };
};
