import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";
import type { GroundPiece } from "#src/models/genshinAssets/fit/GroundPiece";

import { mergeGameDataBuilds } from "#src/services/gameData/mergeGameDataBuilds";
import { fitGroundPiece } from "#src/services/genshinAssets/fit/fitGroundPiece";
import { splitGroundPiece } from "#src/services/genshinAssets/fit/splitGroundPiece";
import { GROUND_GATE_SAMPLES } from "#src/services/genshinAssets/shared/constants";

// A piece fitted, and where its bar misses its gate, its four quarters fitted the same way, until each holds its gate or
// Reads on fewer samples than a gate needs. A piece that cannot split is refused in place
export const fitGroundPieces = async (
  region: DerivedAssetComponent,
  piece: GroundPiece,
  isSplittable: boolean,
): Promise<GameDataBuild> => {
  const fit = await fitGroundPiece(region, piece);
  if (fit.isHeld || !isSplittable || fit.sampleCount < GROUND_GATE_SAMPLES) return fit.build;
  const quarters: GameDataBuild[] = [];
  for (const quarter of splitGroundPiece(piece))
    // oxlint-disable-next-line no-await-in-loop -- one piece at a time, as runFits fits one at a time: a piece's compute holds the thread
    quarters.push(await fitGroundPieces(region, quarter, true));
  return mergeGameDataBuilds([
    fit.build,
    { notes: [`${piece.key}: refused, split into its four quarters`], objects: {} },
    ...quarters,
  ]);
};
