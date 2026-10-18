import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";

import { fitGroundPieces } from "#src/services/genshinAssets/fit/fitGroundPieces";
import { readRegionAreas } from "#src/services/genshinAssets/fit/readGroundPieceAreas";
import { toGroundPiece } from "#src/services/genshinAssets/fit/toGroundPiece";

export interface RegionGroundFit {
  isQualified: boolean;
  // What holds the region back when it does not qualify, its refused areas and its outline-less ones
  reason: string;
  // Each outlined area's build, in the catalogue's order
  pieces: { areaId: string; build: GameDataBuild }[];
}

// A region's ground fitted in pieces, all or nothing: its pieces publish only when every one of its areas holds, since a
// Region swaps its plateau for them only then. An area with no outline has no piece, so the plateau's ground under it
// Would be a hole once the plateau is retired, and it holds the region back the same way
export const fitRegionGroundPieces = async (region: DerivedAssetComponent): Promise<RegionGroundFit> => {
  const areas = await readRegionAreas(region);
  const pieces: { areaId: string; build: GameDataBuild; isRefused: boolean }[] = [];
  for (const area of areas.filter(({ outline }) => outline.length > 0))
    // oxlint-disable-next-line no-await-in-loop -- one piece at a time, as runFits fits one at a time: a piece's compute holds the thread
    pieces.push({ areaId: area.id, ...(await fitGroundPieces(region, toGroundPiece(region, area), true)) });
  const reasons = [
    ...pieces.filter(({ isRefused }) => isRefused).map(({ areaId }) => `${areaId} refused`),
    ...areas.filter(({ outline }) => outline.length === 0).map(({ id }) => `${id} has no outline`),
  ];
  return {
    isQualified: reasons.length === 0,
    pieces: pieces.map(({ areaId, build }) => ({ areaId, build })),
    reason: reasons.join(", "),
  };
};
