import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";

import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { describe } from "vitest";

// A combatant at level one with no attributes beyond its base, holding the kit given
export const createKitCombatant = (characterId: number, kit: Kit): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId,
  constellationCount: 0,
  elementalResonances: [],
  kit,
  level: 1,
});

describe.todo("createKitCombatant");
