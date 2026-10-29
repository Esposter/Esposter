import type { Catalogue } from "#src/models/genshinAssets/fit/Catalogue";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { GroundPieceArea } from "#src/models/genshinAssets/shared/GroundPieceArea";

import { CATALOGUE_PATH } from "#src/services/genshinAssets/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFile } from "node:fs/promises";

// Every area a region's catalogue entry gives, in the catalogue's order, an area with no outline included
export const readRegionAreas = async (region: DerivedAssetComponent): Promise<GroundPieceArea[]> => {
  const { regions } = parseMachineJson<Catalogue>(await readFile(CATALOGUE_PATH, "utf8"));
  return regions.find(({ id }) => id === region)?.areas ?? [];
};
