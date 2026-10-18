import type { GcgSideState } from "#src/models/gcg/GcgSideState";

import { rollGcgDice } from "#src/services/gcg/rollGcgDice";
import { takeOne } from "@esposter/shared";

// Throws again the dice a side names, from the seeded source, and keeps the faces of the others. The caller checks that
// Each named die is one the side has
export const rethrowGcgDice = (side: GcgSideState, diceIndices: number[], random: () => number): void => {
  const rethrownFaces = rollGcgDice(diceIndices.length, random);
  side.dice = side.dice.map((face, index) => {
    const position = diceIndices.indexOf(index);
    return position === -1 ? face : takeOne(rethrownFaces, position);
  });
};
