/* oxlint-disable no-await-in-loop -- Order is the contract: the build's notes and records keep the depth-first order the walk fits them in, and every piece is fitted one at a time, as runFits fits one piece at a time */
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

// A piece fitted, and where its bar misses its gate, its four quarters fitted the same way, until each holds its gate or
// Reads on fewer samples than a gate needs. A quarter reading under that minimum joins the sibling sharing an edge with the
// Fewest samples, and the pair is fitted as one piece, refused where it misses rather than split again. A piece reading on
// Fewer samples than the minimum is refused in place. Every quarter is fitted before the groups are chosen, since a quarter's
// Sample count is its own fit's, so a joined quarter's fit is discarded for its pair's
export const fitGroundPieces = async (piece: GroundPiece, source: GroundSource): Promise<GroundPiecesFit> => {
  const builds: GameDataBuild[] = [];
  let isRefused = false;
  // Depth first over the split, so a refused piece's groups are pushed in reverse and the first of them is fitted next
  const pending: { fit?: GroundPieceFit; isJoined: boolean; piece: GroundPiece }[] = [{ isJoined: false, piece }];
  for (let next = pending.pop(); next !== undefined; next = pending.pop()) {
    const fit = next.fit ?? (await fitGroundPiece(next.piece, source));
    builds.push(fit.build);
    if (fit.isHeld) continue;
    if (next.isJoined || fit.sampleCount < GROUND_GATE_SAMPLES) {
      isRefused = true;
      continue;
    }

    const quarters = await fitQuarters(next.piece, source);
    const groups = groupGroundQuarters(
      quarters.map(({ fit: quarterFit }) => quarterFit.sampleCount),
      GROUND_GATE_SAMPLES,
    );
    const groupPieces = groups.map((group) => {
      const members = group.map((index) => takeOne(quarters, index));
      const member = takeOne(members, 0);
      return members.length === 1
        ? { fit: member.fit, isJoined: false, piece: member.piece }
        : {
            isJoined: true,
            piece: joinGroundPieces(
              members.map(({ piece: quarter }) => quarter),
              `${next.piece.key}/${group.join("-")}`,
            ),
          };
    });
    const joinNotes = groups
      .filter((group) => group.length > 1)
      .map(
        (group) =>
          `${next.piece.key}: quarters ${group.join(" and ")} read ${group.map((index) => takeOne(quarters, index).fit.sampleCount).join(" and ")} samples against the ${GROUND_GATE_SAMPLES} its gate needs, so they join as one piece`,
      );
    builds.push({ notes: [`${next.piece.key}: refused, split into its four quarters`, ...joinNotes], objects: {} });
    pending.push(...groupPieces.toReversed());
  }
  return { build: mergeGameDataBuilds(builds), isRefused };
};
