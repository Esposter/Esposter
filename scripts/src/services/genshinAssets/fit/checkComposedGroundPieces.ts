import type { GroundPieceFit } from "#src/models/genshinAssets/fit/GroundPieceFit";
import type { RegionGround } from "genshin-world";

import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { computeRootMeanSquare } from "#src/services/recreation/statistics/computeRootMeanSquare";
import { createWorldHeight, toLaidGround } from "genshin-world";

export interface ComposedGroundPieceCheck {
  bar: number;
  fit: GroundPieceFit;
  gate: number;
  isHeld: boolean;
}

// Each held piece of a region is read through the world's own composition.
// The same function lays the region's pieces over Windrise's base that the world lays.
// So a piece's composed bar is the RMS of that height less the tiles at its samples.
// It holds when at or under the gate its own fit gave it.
export const checkComposedGroundPieces = (
  base: [RegionGround, ...RegionGround[]],
  region: { areas: { id: string; outline: { x: number; z: number }[] }[]; id: string },
  held: GroundPieceFit[],
): ComposedGroundPieceCheck[] => {
  const measured = held.flatMap((fit) => (fit.measure ? [{ fit, measure: fit.measure }] : []));
  const getHeight = createWorldHeight(
    base,
    measured.map(({ fit, measure }) => toLaidGround(fit.key, measure.ground, [region])),
  );
  return measured.map(({ fit, measure }) => {
    const bar = roundFitted(computeRootMeanSquare(measure.samples.map(({ height, x, z }) => getHeight(x, z) - height)));
    return { bar, fit, gate: measure.gate, isHeld: bar <= measure.gate };
  });
};
