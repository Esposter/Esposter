import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";
import type { GcgZoneCard } from "#src/models/gcg/GcgZoneCard";

import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";

// Puts a card on a side's field, or, when a card of its kind is already there, refreshes that one to its starting usages
// and rounds, as the game does, rather than adding a second to the field
export const placeGcgZoneCard = (zoneCards: GcgZoneCard[], cardId: number, module: GcgCardModule): void => {
  const onField = zoneCards.find((zoneCard) => zoneCard.cardId === cardId);
  if (onField) Object.assign(onField, createGcgZoneCard(cardId, module));
  else zoneCards.push(createGcgZoneCard(cardId, module));
};
