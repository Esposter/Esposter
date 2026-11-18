import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { GroundPieceArea } from "#src/models/genshinAssets/shared/GroundPieceArea";

import { readCatalogueRegions } from "#src/services/genshinAssets/shared/readCatalogueRegions";

// The catalogue's area a sub-area component names, with its outline. Undefined for a region, whose component is its
// Capital's world and no area of the catalogue
export const readSubareaArea = async (component: DerivedAssetComponent): Promise<GroundPieceArea | undefined> =>
  (await readCatalogueRegions()).flatMap(({ areas }) => areas).find(({ id }) => id === component);
