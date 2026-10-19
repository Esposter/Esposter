import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { CharacterIdCreateKitBehaviourMap } from "#src/generated/characterKitMap/CharacterIdCreateKitBehaviourMap";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createTravelerKitBehaviour } from "#src/services/kit/travelerKit";

// A character's behaviour module as its kit builds from its record: its own module, the Traveler's for her, and for a
// Character with none of its own a behaviour that adds nothing to the record's kit
export const readCreateKitBehaviour = async (
  characterId: number,
): Promise<(reader: KitRecordReader) => KitBehaviour> => {
  const loadCreateBehaviour = CharacterIdCreateKitBehaviourMap[characterId];
  if (loadCreateBehaviour) return loadCreateBehaviour();
  if (characterId === TRAVELER_CHARACTER_ID) return createTravelerKitBehaviour;
  return () => ({});
};
