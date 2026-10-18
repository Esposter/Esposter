import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";
import type { GcgZoneCard } from "#src/models/gcg/GcgZoneCard";

import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";

// Puts a summon or a combat status on its zone, or, when one of that card is already there, refreshes it to its starting
// Usages and rounds, as the game does, rather than adding a second. A support or an onstage takes a slot of its own
export const placeGcgZoneCard = (zoneCards: GcgZoneCard[], cardId: number, module: GcgCardModule): void => {
  const onField = zoneCards.find((zoneCard) => zoneCard.cardId === cardId);
  if (onField) {
    onField.rounds = module.initialRounds ?? 0;
    onField.usages = module.initialUsages ?? 0;
  } else zoneCards.push(createGcgZoneCard(cardId, module));
};
