import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { checkIsGcgIndexSelection } from "#src/services/gcg/checkIsGcgIndexSelection";
import { rethrowGcgDice } from "#src/services/gcg/effects/rethrowGcgDice";
import { takeOne } from "@esposter/shared";

const TOSS_UP_REROLL_COUNT = 2;

// Toss-Up: select any Elemental Dice to reroll, and it can reroll two times. Its choice gives each reroll the dice it throws
// Again, in turn, from the duel's random source. A selection naming a die the side does not have is passed over and does not
// Count toward the two
export const tossUp: GcgCardModule = {
  play: ({ duel, sideIndex }, _targetIndex, choice) => {
    const side = takeOne(duel.sides, sideIndex);
    const selections = (choice?.rerollDiceIndices ?? []).filter((diceIndices) =>
      checkIsGcgIndexSelection(diceIndices, side.dice.length),
    );
    for (const diceIndices of selections.slice(0, TOSS_UP_REROLL_COUNT)) rethrowGcgDice(side, diceIndices, duel.random);
  },
};
