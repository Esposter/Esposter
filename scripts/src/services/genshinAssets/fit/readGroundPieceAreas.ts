import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { GroundPieceArea } from "#src/models/genshinAssets/shared/GroundPieceArea";

import { checkHasOutline } from "#src/services/genshinAssets/fit/checkHasOutline";
import { checkIsSurfaceArea } from "#src/services/genshinAssets/fit/checkIsSurfaceArea";
import { readRegionAreas } from "#src/services/genshinAssets/fit/readRegionAreas";

// A region's surface areas the catalogue outlines, each one a piece of its ground, in the catalogue's order. An area on
// Another layer is no piece, and an area it gives no outline is no piece either, since no ground is fitted inside an
// Outline that is not there
export const readGroundPieceAreas = async (region: DerivedAssetComponent): Promise<GroundPieceArea[]> =>
  (await readRegionAreas(region)).filter((area) => checkIsSurfaceArea(area) && checkHasOutline(area));
