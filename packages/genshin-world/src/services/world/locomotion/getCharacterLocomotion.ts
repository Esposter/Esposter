import type { Locomotion } from "genshin-engine";

import { CharacterDataMap } from "#src/services/character/CharacterDataMap";
import { BodyTypeLocomotionMap } from "#src/services/world/locomotion/BodyTypeLocomotionMap";
import { InvalidOperationError, Operation } from "@esposter/shared";

// How a character moves: its body type's movement, by the character's id in the roster
export const getCharacterLocomotion = (characterId: number): Locomotion => {
  const characterData = CharacterDataMap.get(characterId);
  if (!characterData)
    throw new InvalidOperationError(Operation.Read, getCharacterLocomotion.name, `character ${characterId}`);
  return BodyTypeLocomotionMap[characterData.bodyType];
};
