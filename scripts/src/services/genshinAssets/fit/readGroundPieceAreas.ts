import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { GroundPieceArea } from "#src/models/genshinAssets/shared/GroundPieceArea";

import { checkHasOutline } from "#src/services/genshinAssets/fit/checkHasOutline";
import { readRegionAreas } from "#src/services/genshinAssets/fit/readRegionAreas";

// A region's areas the catalogue outlines, each one a piece of its ground, in the catalogue's order. An area it gives no
// Outline is no piece, since no ground is fitted inside an outline that is not there
export const readGroundPieceAreas = async (region: DerivedAssetComponent): Promise<GroundPieceArea[]> =>
  (await readRegionAreas(region)).filter((area) => checkHasOutline(area));
