import type { Element } from "#src/models/Element";
import type { GcgZoneCard } from "#src/models/gcg/GcgZoneCard";

import { GcgCardIdModuleMap } from "#src/services/gcg/cards/gcgCardIdModuleMap";

// Whether one of the cards a character holds makes it immune to the element's damage
export const checkIsGcgElementImmune = (zoneCards: GcgZoneCard[], element: Element): boolean =>
  zoneCards.some(({ cardId }) => GcgCardIdModuleMap.get(cardId)?.immuneElement === element);
