import type { GroundPieceArea } from "#src/models/genshinAssets/fit/GroundPieceArea";

import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { CATALOGUE_PATH } from "#src/services/genshinAssets/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFile } from "node:fs/promises";

interface Catalogue {
  regions: { areas: GroundPieceArea[]; id: string }[];
}

// Every area a region's catalogue entry gives, in the catalogue's order, an area with no outline included
export const readRegionAreas = async (region: DerivedAssetComponent): Promise<GroundPieceArea[]> => {
  const { regions } = parseMachineJson<Catalogue>(await readFile(CATALOGUE_PATH, "utf8"));
  return regions.find(({ id }) => id === region)?.areas ?? [];
};

// A region's areas the catalogue outlines, each one a piece of its ground, in the catalogue's order. An area it gives no
// Outline is no piece, since no ground is fitted inside an outline that is not there
export const readGroundPieceAreas = async (region: DerivedAssetComponent): Promise<GroundPieceArea[]> =>
  (await readRegionAreas(region)).filter(({ outline }) => outline.length > 0);
