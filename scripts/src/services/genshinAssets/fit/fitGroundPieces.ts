/* oxlint-disable no-await-in-loop -- Order is the contract: the build's notes and records keep the depth-first order
   the walk fits them in, and every piece is fitted one at a time, as runFits fits one piece at a time */
import type { GroundPiece } from "#src/models/genshinAssets/fit/GroundPiece";
import type { GroundPieceFit } from "#src/models/genshinAssets/fit/GroundPieceFit";
import type { GroundPiecesFit } from "#src/models/genshinAssets/fit/GroundPiecesFit";
import type { GroundSource } from "#src/models/genshinAssets/fit/GroundSource";
import type { GameDataBuild } from "#src/models/shared/GameDataBuild";

import { mergeGameDataBuilds } from "#src/services/gameData/mergeGameDataBuilds";
import { fitGroundPiece } from "#src/services/genshinAssets/fit/fitGroundPiece";
import { groupGroundQuarters } from "#src/services/genshinAssets/fit/groupGroundQuarters";
import { joinGroundPieces } from "#src/services/genshinAssets/fit/joinGroundPieces";
import { splitGroundPiece } from "#src/services/genshinAssets/fit/splitGroundPiece";
import { GROUND_GATE_SAMPLES } from "#src/services/genshinAssets/shared/constants";
import { takeOne } from "@esposter/shared";
import { getGroundPieceKey } from "genshin-world";

// Each of a split's four quarters fitted with the piece it fits, one fit at a time
const fitQuarters = async (
  piece: GroundPiece,
  source: GroundSource,
): Promise<{ fit: GroundPieceFit; piece: GroundPiece }[]> => {
  const quarters: { fit: GroundPieceFit; piece: GroundPiece }[] = [];
  for (const quarter of splitGroundPiece(piece))
    quarters.push({ fit: await fitGroundPiece(quarter, source), piece: quarter });
  return quarters;
};

// A piece fitted, and where its bar misses its gate, its four quarters fitted the same way, until each holds its gate
// Or reads on fewer samples than a gate needs. The quarters reading under that minimum are grouped by
// `groupGroundQuarters`, each group fitted as one piece and kept only where it holds its gate, so a quarter no group
// Holds is refused. A piece reading on fewer samples than the minimum is refused in place. Every quarter is fitted
// Before the groups are chosen, since A quarter's sample count is its own fit's, so a quarter's fit is discarded for
// The group it joins
export const fitGroundPieces = async (piece: GroundPiece, source: GroundSource): Promise<GroundPiecesFit> => {
  const builds: GameDataBuild[] = [];
  const held: GroundPieceFit[] = [];
  let isRefused = false;
  // Depth first over the split, so a refused piece's groups are pushed in reverse and the first of them is fitted next
  const pending: { fit: GroundPieceFit; piece: GroundPiece }[] = [{ fit: await fitGroundPiece(piece, source), piece }];
  for (let next = pending.pop(); next !== undefined; next = pending.pop()) {
    builds.push(next.fit.build);
    if (next.fit.isHeld) {
      held.push(next.fit);
      continue;
    }
    if (next.fit.sampleCount < GROUND_GATE_SAMPLES) {
      isRefused = true;
      continue;
    }

    const quarters = await fitQuarters(next.piece, source);
    const toJoinedPiece = (indices: number[]): GroundPiece =>
      joinGroundPieces(
        indices.map((index) => takeOne(quarters, index).piece),
        getGroundPieceKey(next.piece.key, indices),
      );
    // Every joined group the search fits is kept, so one it does not keep reports its bar beside the split
    const attempts: GroundPieceFit[] = [];
    const groups = await groupGroundQuarters(
      quarters.map(({ fit }) => fit),
      GROUND_GATE_SAMPLES,
      async (indices) => {
        const fit = await fitGroundPiece(toJoinedPiece(indices), source);
        attempts.push(fit);
        return fit;
      },
    );
    const groupPieces = groups.map(({ fit, indices }) => ({
      fit,
      piece: indices.length === 1 ? takeOne(quarters, indices[0]).piece : toJoinedPiece(indices),
    }));
    const joinNotes = groups
      .filter(({ indices }) => indices.length > 1)
      .map(
        ({ indices }) =>
          `${next.piece.key}: quarters ${indices.join(" and ")} read ${indices.map((index) => takeOne(quarters, index).fit.sampleCount).join(" and ")} samples, and join as one piece that holds its gate`,
      );
    const discarded = attempts.filter((attempt) => !groups.some(({ fit }) => fit === attempt));
    builds.push(
      { notes: [`${next.piece.key}: refused, split into its four quarters`, ...joinNotes], objects: {} },
      ...discarded.map(({ build }) => build),
    );
    pending.push(...groupPieces.toReversed());
  }
  return { build: mergeGameDataBuilds(builds), held, isRefused };
};
