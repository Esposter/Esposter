import { CatalyzeReactionType } from "#src/models/combat/CatalyzeReactionType";

// Each catalyze reaction's bonus to its hit's base damage as a multiple of the triggering character's level multiplier
export const CatalyzeReactionCoefficientMap: Record<CatalyzeReactionType, number> = {
  [CatalyzeReactionType.Aggravate]: 1.15,
  [CatalyzeReactionType.Spread]: 1.25,
};
