import type { Character } from "#src/models/character/Character";
import type { Constellation } from "#src/models/character/Constellation";

import { ConstellationActivationRefusal } from "#src/models/character/ConstellationActivationRefusal";

// Why a character's next constellation cannot be activated now, or undefined when it can: the set's constellations all
// Being active is checked before the Stella Fortuna is, so a character with nothing left to activate is refused for that
export const getConstellationActivationRefusal = (
  character: Character,
  constellations: readonly Constellation[],
): ConstellationActivationRefusal | undefined => {
  if (character.constellationCount >= constellations.length) return ConstellationActivationRefusal.AllActive;
  else if (character.stellaFortunaCount < 1) return ConstellationActivationRefusal.NoStellaFortuna;
  return undefined;
};
