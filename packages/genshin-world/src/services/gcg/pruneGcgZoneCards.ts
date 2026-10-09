import type { GcgSideState } from "#src/models/gcg/GcgSideState";
import type { GcgZoneCard } from "#src/models/gcg/GcgZoneCard";

import { GcgCardIdModuleMap } from "#src/services/gcg/cards/gcgCardIdModuleMap";

// Takes off a side's field the cards whose usages or rounds have run out, for those cards whose module gives them any
export const pruneGcgZoneCards = (side: GcgSideState): void => {
  side.supports = side.supports.filter((zoneCard) => !checkIsGcgZoneCardSpent(zoneCard));
  side.summons = side.summons.filter((zoneCard) => !checkIsGcgZoneCardSpent(zoneCard));
  side.onstages = side.onstages.filter((zoneCard) => !checkIsGcgZoneCardSpent(zoneCard));
  for (const character of side.characters) {
    character.equipments = character.equipments.filter((zoneCard) => !checkIsGcgZoneCardSpent(zoneCard));
    character.statuses = character.statuses.filter((zoneCard) => !checkIsGcgZoneCardSpent(zoneCard));
  }
};

const checkIsGcgZoneCardSpent = (zoneCard: GcgZoneCard): boolean => {
  const module = GcgCardIdModuleMap.get(zoneCard.cardId);
  return (
    (module?.initialUsages !== undefined && zoneCard.usages <= 0) ||
    (module?.initialRounds !== undefined && zoneCard.rounds <= 0)
  );
};
