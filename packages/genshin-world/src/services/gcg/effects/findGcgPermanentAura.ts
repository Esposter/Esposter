import type { Element } from "#src/models/Element";
import type { GcgZoneCard } from "#src/models/gcg/GcgZoneCard";

import { GcgCardIdModuleMap } from "#src/services/gcg/cards/gcgCardIdModuleMap";

// The element a character always has applied, as one of the cards it holds gives it, or nothing when none does
export const findGcgPermanentAura = (zoneCards: GcgZoneCard[]): Element | undefined =>
  zoneCards.map(({ cardId }) => GcgCardIdModuleMap.get(cardId)?.permanentAura).find((element) => element !== undefined);
