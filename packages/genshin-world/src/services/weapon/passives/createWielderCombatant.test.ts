import type { AttributeLine } from "#src/models/character/AttributeLine";
import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

// The Traveler a weapon passive's suite wields at level one with her kit, the attribute lines given and no resonances
export const createWielderCombatant = (attributeLines: readonly AttributeLine[] = []): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes(attributeLines),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 1,
});

describe.todo("createWielderCombatant");
