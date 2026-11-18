import type { GroundSource } from "#src/models/genshinAssets/fit/GroundSource";
import type { RegionGroundFit } from "#src/models/genshinAssets/fit/RegionGroundFit";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { GroundPieceArea } from "#src/models/genshinAssets/shared/GroundPieceArea";
import type { GameDataBuild } from "#src/models/shared/GameDataBuild";

import { checkHasOutline } from "#src/services/genshinAssets/fit/checkHasOutline";
import { checkIsSurfaceArea } from "#src/services/genshinAssets/fit/checkIsSurfaceArea";
import { fitGroundPieces } from "#src/services/genshinAssets/fit/fitGroundPieces";
import { toGroundPiece } from "#src/services/genshinAssets/fit/toGroundPiece";

// A region's ground fitted in pieces, all or nothing: its pieces publish only when every one of its surface areas holds,
// Since a region swaps its plateau for them only then. A surface area with no outline has no piece, so the plateau's
// Ground under it would be a hole once the plateau is retired, and it holds the region back the same way. An area on
// Another layer carries its own terrain, so it is neither fitted nor counted
export const fitRegionGroundPieces = async (
  region: DerivedAssetComponent,
  areas: GroundPieceArea[],
  source: Promise<GroundSource>,
): Promise<RegionGroundFit> => {
  const groundSource = await source;
  const surfaceAreas = areas.filter((area) => checkIsSurfaceArea(area));
  const pieces: { areaId: string; build: GameDataBuild; isRefused: boolean }[] = [];
  for (const area of surfaceAreas.filter((candidate) => checkHasOutline(candidate)))
    // oxlint-disable-next-line no-await-in-loop -- One device: a piece's compute holds the thread, as runFits runs its fits one at a time
    pieces.push({ areaId: area.id, ...(await fitGroundPieces(toGroundPiece(region, area), groundSource)) });
  const reasons = [
    ...pieces.filter(({ isRefused }) => isRefused).map(({ areaId }) => `${areaId} refused`),
    ...surfaceAreas.filter((area) => !checkHasOutline(area)).map(({ id }) => `${id} has no outline`),
  ];
  return {
    isQualified: reasons.length === 0,
    pieces: pieces.map(({ areaId, build }) => ({ areaId, build })),
    reason: reasons.join(", "),
  };
};
