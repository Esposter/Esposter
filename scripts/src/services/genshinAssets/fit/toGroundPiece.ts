import type { GroundPiece } from "#src/models/genshinAssets/fit/GroundPiece";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { GroundPieceArea } from "#src/models/genshinAssets/shared/GroundPieceArea";

import { checkIsInsideRegionOutlines } from "#src/services/genshinAssets/fit/checkIsInsideRegionOutlines";
import { getGroundPieceSquare, getRegionGroundPieceKey } from "genshin-world";

// An area's piece, fitted over its own outline: the square of its bounding box round the box's centre, its samples
// Those inside the outline
export const toGroundPiece = (region: DerivedAssetComponent, { id, outline }: GroundPieceArea): GroundPiece => {
  const outlines = [outline];
  return {
    ...getGroundPieceSquare(outline),
    checkIsInside: (x, z) => checkIsInsideRegionOutlines(outlines, x, z),
    key: getRegionGroundPieceKey(region, id),
  };
};
