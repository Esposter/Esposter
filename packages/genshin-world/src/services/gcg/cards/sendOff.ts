import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { takeOne } from "@esposter/shared";

const SEND_OFF_USAGES = 2;

// Send Off: one opposing summon, chosen by its place on the field, loses two usages, and is taken off once it has none (the
// Duel prunes the field after the card is played)
export const sendOff: GcgCardModule = {
  canPlay: ({ duel, sideIndex }, targetIndex) =>
    targetIndex !== undefined && takeOne(duel.sides, 1 - sideIndex).summons.at(targetIndex) !== undefined,
  play: ({ duel, sideIndex }, targetIndex) => {
    const summon = targetIndex === undefined ? undefined : takeOne(duel.sides, 1 - sideIndex).summons.at(targetIndex);
    if (summon) summon.usages -= SEND_OFF_USAGES;
  },
};
