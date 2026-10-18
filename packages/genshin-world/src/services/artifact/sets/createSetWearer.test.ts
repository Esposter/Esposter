import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";

import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { describe } from "vitest";

// The Traveler at level one, with no attributes beyond its base, wearing the kit given
export const createSetWearer = (kit: Kit): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit,
  level: 1,
});

describe.todo("createSetWearer");
