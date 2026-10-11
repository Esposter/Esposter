import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { Kit } from "#src/models/kit/Kit";

import { CharacterIdCreateKitMap } from "#src/generated/characterKitMap/CharacterIdCreateKitMap";
import { tagKitHits } from "#src/services/kit/tagKitHits";
import { createTravelerKit } from "#src/services/kit/travelerKit";

// A character's kit built from the loaded talent multipliers: its own module's if it has one, else the Traveler's, each
// Hit of its actions dealing the kind of attack its action does
export const createCharacterKit = (characterId: number, talentMultiplierMap: TalentMultiplierMap): Kit =>
  tagKitHits((CharacterIdCreateKitMap[characterId] ?? createTravelerKit)(talentMultiplierMap));
