import type { GameDataBuild } from "#src/models/shared/GameDataBuild";
import type { GroundPieceArea } from "#src/models/genshinAssets/shared/GroundPieceArea";
import type { RegionGroundFit } from "#src/models/genshinAssets/fit/RegionGroundFit";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { checkHasOutline } from "#src/services/genshinAssets/fit/checkHasOutline";
import { fitGroundPieces } from "#src/services/genshinAssets/fit/fitGroundPieces";
import { readGroundSource } from "#src/services/genshinAssets/fit/readGroundSource";
import { toGroundPiece } from "#src/services/genshinAssets/fit/toGroundPiece";

// A region's ground fitted in pieces, all or nothing: its pieces publish only when every one of its areas holds, since a
// Region swaps its plateau for them only then. An area with no outline has no piece, so the plateau's ground under it
// Would be a hole once the plateau is retired, and it holds the region back the same way
export const fitRegionGroundPieces = async (
  region: DerivedAssetComponent,
  areas: GroundPieceArea[],
): Promise<RegionGroundFit> => {
  const source = await readGroundSource(region);
  const pieces: { areaId: string; build: GameDataBuild; isRefused: boolean }[] = [];
  for (const area of areas.filter((candidate) => checkHasOutline(candidate)))
    // oxlint-disable-next-line no-await-in-loop -- one piece at a time, as runFits fits one at a time: a piece's compute holds the thread
    pieces.push({ areaId: area.id, ...(await fitGroundPieces(toGroundPiece(region, area), source)) });
  const reasons = [
    ...pieces.filter(({ isRefused }) => isRefused).map(({ areaId }) => `${areaId} refused`),
    ...areas.filter((area) => !checkHasOutline(area)).map(({ id }) => `${id} has no outline`),
  ];
  return {
    isQualified: reasons.length === 0,
    pieces: pieces.map(({ areaId, build }) => ({ areaId, build })),
    reason: reasons.join(", "),
  };
};
