import type { Character } from "#src/models/character/Character";
import type { Constellation } from "#src/models/character/Constellation";

import { InvalidOperationError, Operation } from "@esposter/shared";

// A character's next constellation activated, as the game activates them: the one after the last active, spending one
// Of the character's own Stella Fortuna. A refusal throws before anything is returned, so no Stella Fortuna is taken for
// A constellation that is not activated, and a character whose set is empty, Aloy's, activates none
export const activateConstellation = (character: Character, constellations: readonly Constellation[]): Character => {
  const constellationNumber = character.constellationCount + 1;
  if (constellationNumber > constellations.length)
    throw new InvalidOperationError(
      Operation.Update,
      activateConstellation.name,
      `constellation ${constellationNumber}`,
    );
  if (character.stellaFortunaCount < 1)
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
