import type { AssetPlacement } from "#src/models/genshinAssets/shared/AssetPlacement";
import type { Vector } from "#src/models/shared/Vector";

import { toRightHanded } from "#src/services/genshinAssets/shared/toRightHanded";

// Where the exports' objects a family stands for stand, in three's axes: a part placed at its object's own place, as a
// Hull and the door are
export const readObjectPositions = (
  placements: readonly AssetPlacement[],
  checkIsStoodFor: (placement: AssetPlacement) => boolean,
): Vector[] =>
  placements.filter((placement) => checkIsStoodFor(placement)).map(({ position }) => toRightHanded(position));
