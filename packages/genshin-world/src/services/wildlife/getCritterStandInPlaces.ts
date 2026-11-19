import type { MaterialSourcePlace } from "#src/models/wildlife/MaterialSourcePlace";

// The material sources that stand a critter's stand-in at their points: each whose kind says a critter stands there.
// Every source's critter stands at its point but a chest's, whose critter stands at none
export const getCritterStandInPlaces = (materialSources: readonly MaterialSourcePlace[]): MaterialSourcePlace[] =>
  materialSources.filter(({ kind }) => kind.hasStandIn);
