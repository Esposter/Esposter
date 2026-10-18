import type { GroundPieceArea } from "#src/models/genshinAssets/fit/GroundPieceArea";

import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { CATALOGUE_PATH } from "#src/services/genshinAssets/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFile } from "node:fs/promises";

interface Catalogue {
  regions: { areas: GroundPieceArea[]; id: string }[];
}

// A region's areas the catalogue outlines, each one a piece of its ground, in the catalogue's order. An area it gives no
// Outline is no piece, since no ground is fitted inside an outline that is not there
export const readGroundPieceAreas = async (region: DerivedAssetComponent): Promise<GroundPieceArea[]> => {
  const { regions } = parseMachineJson<Catalogue>(await readFile(CATALOGUE_PATH, "utf8"));
  return (regions.find(({ id }) => id === region)?.areas ?? []).filter(({ outline }) => outline.length > 0);
};
