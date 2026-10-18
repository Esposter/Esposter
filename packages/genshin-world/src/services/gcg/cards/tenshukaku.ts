import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { GcgDieFace } from "#src/models/gcg/GcgDieFace";
import { createGcgDice } from "#src/services/gcg/effects/createGcgDice";
import { takeOne } from "@esposter/shared";

const TENSHUKAKU_DIE_KINDS = 5;

// Tenshukaku, a Support: when the Action Phase begins, with 5 different kinds of Elemental Die, an Omni Die is created
export const tenshukaku: GcgCardModule = {
  onActionPhase: ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    const kinds = new Set(side.dice.filter((face) => face !== GcgDieFace.Omni));
    if (kinds.size >= TENSHUKAKU_DIE_KINDS) createGcgDice(side, GcgDieFace.Omni, 1);
  },
};
