import type { Character } from "#src/models/character/Character";
import type { Constellation } from "#src/models/character/Constellation";

import { ConstellationActivationRefusal } from "#src/models/character/ConstellationActivationRefusal";
import { getConstellationActivationRefusal } from "#src/services/character/getConstellationActivationRefusal";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A character's next constellation activated, as the game activates them: the one after the last active, spending one
// Of the character's own Stella Fortuna. A refusal, the one getConstellationActivationRefusal names, throws before
// Anything is returned, so no Stella Fortuna is taken for a constellation that is not activated, and a character whose
// Set is empty, Aloy's, activates none
export const activateConstellation = (character: Character, constellations: readonly Constellation[]): Character => {
  const constellationNumber = character.constellationCount + 1;
  const refusal = getConstellationActivationRefusal(character, constellations);
  if (refusal === ConstellationActivationRefusal.AllActive)
    throw new InvalidOperationError(
      Operation.Update,
      activateConstellation.name,
      `constellation ${constellationNumber}`,
    );
  else if (refusal === ConstellationActivationRefusal.NoStellaFortuna)
    throw new InvalidOperationError(
      Operation.Update,
      activateConstellation.name,
      `a Stella Fortuna for constellation ${constellationNumber}`,
    );
  return {
    ...character,
    constellationCount: constellationNumber,
    stellaFortunaCount: character.stellaFortunaCount - 1,
  };
};
