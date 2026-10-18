import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { GcgCostKind } from "#src/models/gcg/GcgCostKind";
import { TENKO_KENSHIN_ID } from "#src/services/gcg/cards/tenkoKenshin";
import { YAKAN_EVOCATION_ID } from "#src/services/gcg/cards/yakanEvocation";
import { createGcgTalentCard } from "#src/services/gcg/effects/createGcgTalentCard";

export const THE_SHRINES_SACRED_SHADE_ID = 214_081;
const YAE_MIKO_ID = 1_408;
const SHRINES_SACRED_SHADE_REDUCTION = 2;

// The Shrine's Sacred Shade, Yae Miko's talent: it is equipped and Great Secret Art: Tenko Kenshin is used at once. Its counter
// Is set to the round when Yae Miko destroys a Sesshou Sakura through Tenko Kenshin, and the next Yakan Evocation this round
// Then costs two Elemental Dice less
export const theShrinesSacredShade: GcgCardModule = {
  ...createGcgTalentCard(YAE_MIKO_ID, TENKO_KENSHIN_ID),
  onCostPaid: (_context, subject, zoneCard) => {
    if (subject.skill?.id === YAKAN_EVOCATION_ID) zoneCard.counter = 0;
  },
  reduceCost: ({ duel }, subject, zoneCard) =>
    subject.skill?.id === YAKAN_EVOCATION_ID && zoneCard.counter === duel.round
      ? { count: SHRINES_SACRED_SHADE_REDUCTION, kind: GcgCostKind.Dice }
      : undefined,
};
