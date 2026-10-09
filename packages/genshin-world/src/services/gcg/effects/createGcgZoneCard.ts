import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";
import type { GcgZoneCard } from "#src/models/gcg/GcgZoneCard";

// A card entering the field with the usages and rounds its module gives it, and no counter kept yet
export const createGcgZoneCard = (cardId: number, module: GcgCardModule): GcgZoneCard => ({
  cardId,
  counter: 0,
  rounds: module.initialRounds ?? 0,
  usages: module.initialUsages ?? 0,
});
