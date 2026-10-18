import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { GroundPiece } from "#src/models/genshinAssets/fit/GroundPiece";
import type { GroundPieceArea } from "#src/models/genshinAssets/fit/GroundPieceArea";

import { checkIsInsideRegionOutlines } from "#src/services/genshinAssets/fit/checkIsInsideRegionOutlines";
import { getRegionGroundPieceKey } from "genshin-world";

// An area's piece, fitted over its own outline: the square of its bounding box round the box's centre, its samples those
// Inside the outline
export const toGroundPiece = (region: DerivedAssetComponent, { id, outline }: GroundPieceArea): GroundPiece => {
  const xs = outline.map(({ x }) => x);
  const zs = outline.map(({ z }) => z);
  const outlines = [outline];
  return {
    centre: { x: (Math.min(...xs) + Math.max(...xs)) / 2, z: (Math.min(...zs) + Math.max(...zs)) / 2 },
    half: Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...zs) - Math.min(...zs)) / 2,
    isInside: (x, z) => checkIsInsideRegionOutlines(outlines, x, z),
    key: getRegionGroundPieceKey(region, id),
  };
};
