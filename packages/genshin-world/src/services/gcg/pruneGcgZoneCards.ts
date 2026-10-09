import type { GcgSideState } from "#src/models/gcg/GcgSideState";
import type { GcgZoneCard } from "#src/models/gcg/GcgZoneCard";

import { GcgCardIdModuleMap } from "#src/services/gcg/cards/gcgCardIdModuleMap";

// Takes off a side's field the cards whose usages or rounds have run out, for those cards whose module gives them any
export const pruneGcgZoneCards = (side: GcgSideState): void => {
  side.supports = side.supports.filter((zoneCard) => !isGcgZoneCardSpent(zoneCard));
  side.summons = side.summons.filter((zoneCard) => !isGcgZoneCardSpent(zoneCard));
  side.onstages = side.onstages.filter((zoneCard) => !isGcgZoneCardSpent(zoneCard));
  for (const character of side.characters) {
    character.equipments = character.equipments.filter((zoneCard) => !isGcgZoneCardSpent(zoneCard));
    character.statuses = character.statuses.filter((zoneCard) => !isGcgZoneCardSpent(zoneCard));
  }
};

const isGcgZoneCardSpent = (zoneCard: GcgZoneCard): boolean => {
  const module = GcgCardIdModuleMap.get(zoneCard.cardId);
  return (
    (module?.initialUsages !== undefined && zoneCard.usages <= 0) ||
    (module?.initialRounds !== undefined && zoneCard.rounds <= 0)
  );
};
