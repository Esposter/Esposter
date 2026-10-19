import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { GcgDieFace } from "#src/models/gcg/GcgDieFace";
import { takeOne } from "@esposter/shared";

const INAZUMA = "INAZUMA";
const INAZUMA_CHARACTERS_NEEDED = 2;

// Thunder and Eternity: every Elemental Die of the side becomes an Unaligned die, which an Omni die is, and the card is played
// Only with two Inazuman characters on the side, the deck's two that the card needs
export const thunderAndEternity: GcgCardModule = {
  canPlay: ({ duel, sideIndex }) =>
    takeOne(duel.sides, sideIndex).characters.filter(({ character }) => character.nation === INAZUMA).length >=
    INAZUMA_CHARACTERS_NEEDED,
  play: ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    side.dice = side.dice.map(() => GcgDieFace.Omni);
  },
};
