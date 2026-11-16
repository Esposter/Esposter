import type { GroundPiece } from "#src/models/genshinAssets/fit/GroundPiece";
import type { GroundPiecesFit } from "#src/models/genshinAssets/fit/GroundPiecesFit";
import type { GroundSource } from "#src/models/genshinAssets/fit/GroundSource";
import type { GameDataBuild } from "#src/models/shared/GameDataBuild";

import { mergeGameDataBuilds } from "#src/services/gameData/mergeGameDataBuilds";
import { fitGroundPiece } from "#src/services/genshinAssets/fit/fitGroundPiece";
import { splitGroundPiece } from "#src/services/genshinAssets/fit/splitGroundPiece";
import { GROUND_GATE_SAMPLES } from "#src/services/genshinAssets/shared/constants";

// A piece fitted, and where its bar misses its gate, its four quarters fitted the same way, until each holds its gate or
// Reads on fewer samples than a gate needs. A piece reading on fewer samples than that is refused in place
export const fitGroundPieces = async (piece: GroundPiece, source: GroundSource): Promise<GroundPiecesFit> => {
  const builds: GameDataBuild[] = [];
  let isRefused = false;
  // Depth first over the split, so a refused piece's quarters are pushed in reverse and the first of them is fitted next
  const pending = [piece];
  for (let next = pending.pop(); next !== undefined; next = pending.pop()) {
    // oxlint-disable-next-line no-await-in-loop -- Order is the contract: the build's notes and records keep the depth-first order the walk fits them in, as runFits fits one piece at a time
    const fit = await fitGroundPiece(next, source);
    builds.push(fit.build);
    if (fit.isHeld) continue;
    if (fit.sampleCount < GROUND_GATE_SAMPLES) {
      isRefused = true;
      continue;
    }

    builds.push({ notes: [`${next.key}: refused, split into its four quarters`], objects: {} });
    pending.push(...splitGroundPiece(next).toReversed());
  }
  return { build: mergeGameDataBuilds(builds), isRefused };
};
