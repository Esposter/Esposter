import type { Element } from "#src/models/Element";
import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";
import type { GcgZoneCard } from "#src/models/gcg/GcgZoneCard";

// Whether one of the cards a character holds makes it immune to the element's damage
export const checkIsGcgElementImmune = (
  zoneCards: GcgZoneCard[],
  element: Element,
  cardModules: ReadonlyMap<number, GcgCardModule>,
): boolean => zoneCards.some(({ cardId }) => cardModules.get(cardId)?.immuneElement === element);
