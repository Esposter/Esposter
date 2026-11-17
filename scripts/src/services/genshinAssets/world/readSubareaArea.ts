import type { Catalogue } from "#src/models/genshinAssets/fit/Catalogue";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { GroundPieceArea } from "#src/models/genshinAssets/shared/GroundPieceArea";

import { CATALOGUE_PATH } from "#src/services/genshinAssets/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFile } from "node:fs/promises";

// The catalogue's area a sub-area component names, with its outline. Undefined for a region, whose component is its
// Capital's world and no area of the catalogue
export const readSubareaArea = async (component: DerivedAssetComponent): Promise<GroundPieceArea | undefined> => {
  const { regions } = parseMachineJson<Catalogue>(await readFile(CATALOGUE_PATH, "utf8"));
  return regions.flatMap(({ areas }) => areas).find(({ id }) => id === component);
};
