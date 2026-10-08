import type { CharacterData } from "#src/models/character/CharacterData";
import type { Locomotion } from "genshin-engine";

import { BodyTypeLocomotionMap } from "#src/services/world/locomotion/BodyTypeLocomotionMap";
import { InvalidOperationError, Operation } from "@esposter/shared";

// How a character moves: its body type's movement, by the character's id in the roster
export const getCharacterLocomotion = (
  characterId: number,
  characterDataMap: ReadonlyMap<number, CharacterData>,
): Locomotion => {
  const characterData = characterDataMap.get(characterId);
  if (!characterData)
    throw new InvalidOperationError(Operation.Read, getCharacterLocomotion.name, `character ${characterId}`);
  return BodyTypeLocomotionMap[characterData.bodyType];
};
