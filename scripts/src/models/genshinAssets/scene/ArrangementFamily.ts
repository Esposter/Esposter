import type { AssetPlacement } from "#src/models/genshinAssets/shared/AssetPlacement";
import type { Vector } from "#src/models/shared/Vector";

// A family of a scene's parts as its fitted data places them, beside where the exports' objects it stands for stand
// Once composed as the family stands its parts (a lathe at its axis's foot, a hull at its object's place), so a fit
// That drifts from the exports shows as a distance. It is named as the witness names the family it stands for, so the
// Scene's offset for that family carries both into the frame, and a family the scene repeats along a row reads the row
// It is drawn in, its copies each its length further along z from the first
export interface ArrangementFamily {
  name: string;
  readExpected: (placements: readonly AssetPlacement[], meshDirectory: string) => Promise<Vector[]>;
  readPositions: () => Promise<Vector[]>;
  readRow?: () => Promise<{ count: number; length: number }>;
}
