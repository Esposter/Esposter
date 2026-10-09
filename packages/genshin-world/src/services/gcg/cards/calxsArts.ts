import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { takeOne } from "@esposter/shared";

const CALXS_ARTS_STANDBY_LIMIT = 2;

// Calx's Arts: one energy shifts from each of at most two standing characters on standby to the active character, while it
// Has room for it
export const calxsArts: GcgCardModule = {
  canPlay: ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    const active = side.characters.at(side.activeIndex);
    return (
      active !== undefined &&
      active.energy < active.character.maxEnergy &&
      side.characters.some((character, index) => index !== side.activeIndex && character.hp > 0 && character.energy > 0)
    );
  },
  play: ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    const active = takeOne(side.characters, side.activeIndex);
    let shiftedCount = 0;
    for (const [index, character] of side.characters.entries()) {
      if (index === side.activeIndex || character.hp <= 0 || character.energy <= 0) continue;
      if (shiftedCount === CALXS_ARTS_STANDBY_LIMIT || active.energy >= active.character.maxEnergy) break;
      character.energy -= 1;
      active.energy += 1;
      shiftedCount += 1;
    }
  },
};
