import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { Kit } from "#src/models/kit/Kit";

import { CharacterIdCreateKitMap } from "#src/services/kit/CharacterIdCreateKitMap";
import { createTravelerKit } from "#src/services/kit/characters/travelerKit";

// A character's kit built from the loaded talent multipliers: its own module's if it has one, else the Traveler's
export const createCharacterKit = (characterId: number, talentMultiplierMap: TalentMultiplierMap): Kit =>
  (CharacterIdCreateKitMap[characterId] ?? createTravelerKit)(talentMultiplierMap);
