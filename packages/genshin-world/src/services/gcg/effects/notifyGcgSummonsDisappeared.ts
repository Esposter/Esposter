import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgZoneCard } from "#src/models/gcg/GcgZoneCard";

import { takeOne } from "@esposter/shared";

// Tells a side's supports that each summon it held before, and no longer holds, has disappeared, once for each such summon
export const notifyGcgSummonsDisappeared = (duel: GcgDuel, sideIndex: number, summonsBefore: GcgZoneCard[]): void => {
  const side = takeOne(duel.sides, sideIndex);
  const disappearedCount = summonsBefore.filter((summon) => !side.summons.includes(summon)).length;
  for (const zoneCard of side.supports)
    for (let disappearance = 0; disappearance < disappearedCount; disappearance += 1)
      duel.cardModules.get(zoneCard.cardId)?.onSummonDisappears?.({ duel, sideIndex }, zoneCard);
};
