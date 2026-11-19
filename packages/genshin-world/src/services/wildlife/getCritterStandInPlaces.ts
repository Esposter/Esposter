import type { MaterialSourcePlace } from "#src/models/wildlife/MaterialSourcePlace";

// The material sources that stand a critter's stand-in at their points: every one but a butterfly kind's, which stands at
// No point whether or not its gather row picks it up
export const getCritterStandInPlaces = (
  materialSources: readonly MaterialSourcePlace[],
  butterflyKinds: ReadonlySet<number>,
): MaterialSourcePlace[] => materialSources.filter(({ kind }) => !butterflyKinds.has(kind));
