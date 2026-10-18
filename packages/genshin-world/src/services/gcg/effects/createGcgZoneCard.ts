import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";
import type { GcgZoneCard } from "#src/models/gcg/GcgZoneCard";

// A card entering the field with the usages, rounds and counter its module gives it
export const createGcgZoneCard = (cardId: number, module: GcgCardModule): GcgZoneCard => ({
  cardId,
  counter: module.initialCounter ?? 0,
  rounds: module.initialRounds ?? 0,
  usages: module.initialUsages ?? 0,
});
