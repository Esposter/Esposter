import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { GroundPieceArea } from "#src/models/genshinAssets/shared/GroundPieceArea";

import { readCatalogueRegions } from "#src/services/genshinAssets/shared/readCatalogueRegions";

// Every area a region's catalogue entry gives, in the catalogue's order, an area with no outline included
export const readRegionAreas = async (region: DerivedAssetComponent): Promise<GroundPieceArea[]> =>
  (await readCatalogueRegions()).find(({ id }) => id === region)?.areas ?? [];
