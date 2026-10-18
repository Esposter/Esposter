import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";
import type { GcgZoneCard } from "#src/models/gcg/GcgZoneCard";

import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";

// Puts a summon or a combat status on its zone, or, when one of that card is already there, refreshes its rounds to the
// Starting ones and its usages: a card that stacks (it names its most usages) adds its starting usages up to that most,
// And one that does not is refreshed to its starting usages, as the game does, rather than adding a second
export const placeGcgZoneCard = (zoneCards: GcgZoneCard[], cardId: number, module: GcgCardModule): void => {
  const onField = zoneCards.find((zoneCard) => zoneCard.cardId === cardId);
  if (!onField) {
    zoneCards.push(createGcgZoneCard(cardId, module));
    return;
  }
  onField.rounds = module.initialRounds ?? 0;
  onField.usages =
    module.maxUsages === undefined
      ? (module.initialUsages ?? 0)
      : Math.min(module.maxUsages, onField.usages + (module.initialUsages ?? 0));
};
