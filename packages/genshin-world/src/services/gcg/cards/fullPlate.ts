import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { GcgDamageKind } from "#src/models/gcg/GcgDamageKind";
import { takeOne } from "@esposter/shared";

// Full Plate, an onstage: the Physical DMG the active character takes is halved, rounded up, while it holds a shield. The card
// Is taken off once no character on its side holds a shield, so a hit that consumes the shield takes it off the field. The
// Wiki's "this Shield" is the shield the card gave, which the side's one shield pool does not track, so another card's shield
// On the side keeps the card standing
export const fullPlate: GcgCardModule = {
  isSpent: (side) => side.characters.every(({ shield }) => shield <= 0),
  modifyDamageReceived: ({ duel, sideIndex }, value, _zoneCard, damageType) => {
    const side = takeOne(duel.sides, sideIndex);
    const active = side.characters.at(side.activeIndex);
    if (damageType !== GcgDamageKind.Physical || !active || active.shield <= 0) return value;
    return Math.ceil(value / 2);
  },
};
