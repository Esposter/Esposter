import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgSideDamageHook } from "#src/models/gcg/GcgSideDamageHook";

import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { applyGcgDamage } from "#src/services/gcg/applyGcgDamage";
import { GcgCardIdModuleMap } from "#src/services/gcg/cards/gcgCardIdModuleMap";
import { listGcgFieldCards } from "#src/services/gcg/effects/listGcgFieldCards";
import { takeOne } from "@esposter/shared";

// Runs the hook a side's field cards return damage from, when the side is handed its choice of action or declares its
// Round's end, and deals the damage each returns from that side. A card an earlier hook spent is no longer on the field, so it
// Is not run, and the run ends once the duel does
export const runGcgSideDamageHook = (duel: GcgDuel, sideIndex: number, hook: GcgSideDamageHook): void => {
  for (const zoneCard of listGcgFieldCards(takeOne(duel.sides, sideIndex), undefined)) {
    if (duel.phase === GcgPhase.Ended) return;
    if (!listGcgFieldCards(takeOne(duel.sides, sideIndex), undefined).includes(zoneCard)) continue;
    const context = { duel, sideIndex };
    const damage = GcgCardIdModuleMap.get(zoneCard.cardId)?.[hook]?.(context, zoneCard);
    if (damage) applyGcgDamage(duel, sideIndex, damage, duel.rule, context);
  }
};
