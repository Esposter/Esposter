import type { Element } from "#src/models/Element";
import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";
import type { GcgZoneCard } from "#src/models/gcg/GcgZoneCard";

// The element a character always has applied, as one of the cards it holds gives it, or nothing when none does
export const findGcgPermanentAura = (
  zoneCards: GcgZoneCard[],
  cardModules: ReadonlyMap<number, GcgCardModule>,
): Element | undefined =>
  zoneCards.map(({ cardId }) => cardModules.get(cardId)?.permanentAura).find((element) => element !== undefined);
