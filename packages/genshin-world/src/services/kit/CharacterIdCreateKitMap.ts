import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { Kit } from "#src/models/kit/Kit";

import { BENNETT_CHARACTER_ID, DILUC_CHARACTER_ID, MONA_CHARACTER_ID } from "#src/services/character/constants";
import { createBennettKit } from "#src/services/kit/characters/bennettKit";
import { createDilucKit } from "#src/services/kit/characters/dilucKit";
import { createMonaKit } from "#src/services/kit/characters/monaKit";

// Each character's kit by its avatar id, for those whose module is built, made from the loaded talent multipliers. A
// Character with none falls back to the Traveler's kit, as the roster does
export const CharacterIdCreateKitMap: Partial<Record<number, (talentMultiplierMap: TalentMultiplierMap) => Kit>> = {
  [BENNETT_CHARACTER_ID]: createBennettKit,
  [DILUC_CHARACTER_ID]: createDilucKit,
  [MONA_CHARACTER_ID]: createMonaKit,
};
