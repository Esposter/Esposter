import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { GcgDamageKind } from "#src/models/gcg/GcgDamageKind";
import { takeOne } from "@esposter/shared";

// Full Plate, an onstage: the Physical DMG the active character takes is halved, rounded up, while it holds a shield. The card
// Is spent at the end phase once no character on its side holds one, which approximates "until this Shield is consumed": a
// Shield another card gave the side keeps it on the field
export const fullPlate: GcgCardModule = {
  initialUsages: 1,
  modifyDamageReceived: ({ duel, sideIndex }, value, _zoneCard, damageType) => {
    const side = takeOne(duel.sides, sideIndex);
    const active = side.characters.at(side.activeIndex);
    if (damageType !== GcgDamageKind.Physical || !active || active.shield <= 0) return value;
    return Math.ceil(value / 2);
  },
  onEndPhase: ({ duel, sideIndex }, zoneCard) => {
    if (takeOne(duel.sides, sideIndex).characters.every(({ shield }) => shield <= 0)) zoneCard.usages = 0;
    return undefined;
  },
};
