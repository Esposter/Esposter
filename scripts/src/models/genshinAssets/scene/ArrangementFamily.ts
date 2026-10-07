import type { AssetPlacement } from "#src/models/genshinAssets/shared/AssetPlacement";
import type { Vector } from "#src/models/shared/Vector";

// A family of a scene's parts as its fitted data places them, beside where the exports' objects it stands for stand
// Once composed as the family stands its parts (a lathe at its axis's foot, a hull at its object's place), so a fit
// That drifts from the exports shows as a distance
export interface ArrangementFamily {
  name: string;
  readExpected: (placements: readonly AssetPlacement[], meshDirectory: string) => Promise<Vector[]>;
  readPositions: () => Promise<Vector[]>;
}
