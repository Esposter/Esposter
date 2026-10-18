import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { checkIsGcgIndexSelection } from "#src/services/gcg/checkIsGcgIndexSelection";
import { rethrowGcgDice } from "#src/services/gcg/effects/rethrowGcgDice";
import { takeOne } from "@esposter/shared";

// Knights of Favonius Library, a location support: when played, the first valid selection of dice is rerolled once, and in
// Each roll phase while it stands its side gains another chance to reroll
export const knightsOfFavoniusLibrary: GcgCardModule = {
  onRollPhase: ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    side.extraRerolls = (side.extraRerolls ?? 0) + 1;
  },
  play: ({ duel, sideIndex }, _targetIndex, choice) => {
    const side = takeOne(duel.sides, sideIndex);
    const selection = (choice?.rerollDiceIndices ?? []).find((diceIndices) =>
      checkIsGcgIndexSelection(diceIndices, side.dice.length),
    );
    if (selection) rethrowGcgDice(side, selection, duel.random);
  },
};
