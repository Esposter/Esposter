import type { GroundPieceFit } from "#src/models/genshinAssets/fit/GroundPieceFit";
import type { GroundSource } from "#src/models/genshinAssets/fit/GroundSource";
import type { RegionGroundFit } from "#src/models/genshinAssets/fit/RegionGroundFit";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { GroundPieceArea } from "#src/models/genshinAssets/shared/GroundPieceArea";
import type { GameDataBuild } from "#src/models/shared/GameDataBuild";
import type { RegionGround } from "genshin-world";

import { checkComposedGroundPieces } from "#src/services/genshinAssets/fit/checkComposedGroundPieces";
import { checkHasOutline } from "#src/services/genshinAssets/fit/checkHasOutline";
import { checkIsSurfaceArea } from "#src/services/genshinAssets/fit/checkIsSurfaceArea";
import { fitGroundPieces } from "#src/services/genshinAssets/fit/fitGroundPieces";
import { toGroundPiece } from "#src/services/genshinAssets/fit/toGroundPiece";

// A region's ground fitted in pieces, all or nothing: its pieces publish only when every one of its surface areas holds,
// Since a region swaps its plateau for them only then. A surface area with no outline has no piece, so the plateau's
// Ground under it would be a hole once the plateau is retired, and it holds the region back the same way. An area on
// Another layer carries its own terrain, so it is neither fitted nor counted. Each held piece is then read through the
// Composition the world lays, with the region's other pieces over Windrise's base: a piece whose composed bar misses its
// Gate holds the region back, as its own bar would
export const fitRegionGroundPieces = async (
  region: DerivedAssetComponent,
  areas: GroundPieceArea[],
  source: Promise<GroundSource>,
  readBase: () => Promise<[RegionGround, ...RegionGround[]]>,
): Promise<RegionGroundFit> => {
  const groundSource = await source;
  const surfaceAreas = areas.filter((area) => checkIsSurfaceArea(area));
  const outlinedAreas = surfaceAreas.filter((area) => checkHasOutline(area));
  const pieces: { areaId: string; build: GameDataBuild; held: GroundPieceFit[]; isRefused: boolean }[] = [];
  for (const area of outlinedAreas)
    // oxlint-disable-next-line no-await-in-loop -- One device: a piece's compute holds the thread, as runFits runs its fits one at a time
    pieces.push({ areaId: area.id, ...(await fitGroundPieces(toGroundPiece(region, area), groundSource)) });
  const held = pieces.flatMap((piece) => piece.held);
  const composed =
    held.length === 0 ? [] : checkComposedGroundPieces(await readBase(), { areas: outlinedAreas, id: region }, held);
  const reasons = [
    ...pieces.filter(({ isRefused }) => isRefused).map(({ areaId }) => `${areaId} refused`),
    ...surfaceAreas.filter((area) => !checkHasOutline(area)).map(({ id }) => `${id} has no outline`),
    ...composed.filter(({ isHeld }) => !isHeld).map(({ fit }) => `${fit.key} composed bar misses its gate`),
  ];
  return {
    isQualified: reasons.length === 0,
    pieces: pieces.map(({ areaId, build }) => ({
      areaId,
      build: {
        ...build,
        notes: [
          ...build.notes,
          ...composed
            .filter(({ fit }) => fit.key.split("/")[2] === areaId)
            .map(
              ({ bar, fit, gate, isHeld }) =>
                `${fit.key}: composed with the region's pieces laid over the base, ${bar} metres RMS over its ${fit.sampleCount} samples against its gate's ${gate}, ${isHeld ? "held" : "missed, refused"}`,
            ),
        ],
      },
    })),
    reason: reasons.join(", "),
  };
};
