import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";
import type { GcgZoneCard } from "#src/models/gcg/GcgZoneCard";

import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";

// A count placed again: a card that stacks it (it names the most it holds) adds its starting count up to that most,
// And one that does not is refreshed to its starting count, as the game does, rather than adding a second
const refreshOrStack = (current: number, starting: number | undefined, most: number | undefined): number =>
  most === undefined ? (starting ?? 0) : Math.min(most, current + (starting ?? 0));

// Puts a summon or a combat status on its zone, or, when that card is already there, places it again: each count
// Is refreshed or stacked, its rounds and its usages alike, by the card's own starting counts and the most it holds
export const placeGcgZoneCard = (zoneCards: GcgZoneCard[], cardId: number, module: GcgCardModule): void => {
  const onField = zoneCards.find((zoneCard) => zoneCard.cardId === cardId);
  if (!onField) {
    zoneCards.push(createGcgZoneCard(cardId, module));
    return;
  }
  onField.rounds = refreshOrStack(onField.rounds, module.initialRounds, module.maxRounds);
  onField.usages = refreshOrStack(onField.usages, module.initialUsages, module.maxUsages);
};
