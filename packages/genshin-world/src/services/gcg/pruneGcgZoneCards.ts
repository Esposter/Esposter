import type { GcgSideState } from "#src/models/gcg/GcgSideState";
import type { GcgZoneCard } from "#src/models/gcg/GcgZoneCard";

import { GcgCardIdModuleMap } from "#src/services/gcg/cards/gcgCardIdModuleMap";

// Takes off a side's field the cards whose usages or rounds have run out, then the cards that what the side holds has spent,
// For those cards whose module gives them any of either
export const pruneGcgZoneCards = (side: GcgSideState): void => {
  filterGcgSideCards(side, (zoneCard) => !checkIsGcgZoneCardSpent(zoneCard));
  filterGcgSideCards(side, (zoneCard) => !GcgCardIdModuleMap.get(zoneCard.cardId)?.isSpent?.(side, zoneCard));
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

const checkIsGcgZoneCardSpent = (zoneCard: GcgZoneCard): boolean => {
  const module = GcgCardIdModuleMap.get(zoneCard.cardId);
  return (
    (module?.initialUsages !== undefined && zoneCard.usages <= 0) ||
    (module?.initialRounds !== undefined && zoneCard.rounds <= 0)
  );
};
