import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";
import type { GcgZoneCard } from "#src/models/gcg/GcgZoneCard";

import { notifyGcgSummonsDisappeared } from "#src/services/gcg/effects/notifyGcgSummonsDisappeared";
import { takeOne } from "@esposter/shared";

// Takes off a side's field the cards whose usages or rounds have run out, then the cards that what the side holds has spent,
// For those cards whose module gives them any of either. Each summon that goes this way tells the side's supports that it
// Disappeared, once for each summon
export const pruneGcgZoneCards = (duel: GcgDuel, sideIndex: number): void => {
  const side = takeOne(duel.sides, sideIndex);
  const summonsBefore = [...side.summons];
  filterGcgSideCards(side, (zoneCard) => !checkIsGcgZoneCardSpent(zoneCard, duel.cardModules));
  filterGcgSideCards(side, (zoneCard) => !duel.cardModules.get(zoneCard.cardId)?.isSpent?.(side, zoneCard));
  notifyGcgSummonsDisappeared(duel, sideIndex, summonsBefore);
};

const filterGcgSideCards = (side: GcgSideState, keep: (zoneCard: GcgZoneCard) => boolean): void => {
  side.supports = side.supports.filter(keep);
  side.summons = side.summons.filter(keep);
  side.onstages = side.onstages.filter(keep);
  for (const character of side.characters) {
    character.equipments = character.equipments.filter(keep);
    character.statuses = character.statuses.filter(keep);
  }
};

const checkIsGcgZoneCardSpent = (zoneCard: GcgZoneCard, cardModules: GcgDuel["cardModules"]): boolean => {
  const module = cardModules.get(zoneCard.cardId);
  return (
    (module?.initialUsages !== undefined && zoneCard.usages <= 0) ||
    (module?.initialRounds !== undefined && zoneCard.rounds <= 0)
  );
};
