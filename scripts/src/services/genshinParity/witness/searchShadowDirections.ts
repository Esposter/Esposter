import type { PricedDirection } from "#src/models/genshinParity/witness/PricedDirection";
import type { Vector } from "#src/models/shared/Vector";

import { countSetPixels } from "#src/services/genshinParity/witness/countSetPixels";
import { getSkyGridDirections } from "#src/services/genshinParity/witness/getSkyGridDirections";
import { toAngles } from "#src/services/genshinParity/witness/toAngles";
import { toSunDirection } from "#src/services/genshinParity/witness/toSunDirection";
import { minimizeNelderMead } from "#src/services/recreation/solve/minimizeNelderMead";

// The solve's first step about each angle, in degrees, and how many steps of the simplex it takes from each start
const SOLVE_STEP_DEGREES = 5;
const SOLVE_ITERATION_COUNT = 40;
// The grid's best directions the simplex starts from
const SOLVE_START_COUNT = 3;
// The directions a solve prices first about the scene's, its heading and its height each turned either way, in degrees,
// So an objective no direction moves shows before the simplex settles on its start
const PROBE_TURNS_DEGREES: readonly [number, number][] = [
  [-15, 0],
  [15, 0],
  [0, -10],
  [0, 10],
];

// The directions a shadow solve prices beyond the scene's own: probes about it, every direction of the sky's grid, and
// The simplex each of the grid's best few starts, whose best is the solved direction. Nothing is priced when the solve
// Is Not told to solve
export const searchShadowDirections = async (
  price: (candidate: Readonly<Vector>) => Promise<{ distance: number; edges: Uint8Array }>,
  direction: Readonly<Vector>,
  isSolved: boolean,
): Promise<{ gridBest: PricedDirection[]; probes: PricedDirection[]; solvedDirection?: undefined | Vector }> => {
  if (!isSolved) return { gridBest: [], probes: [], solvedDirection: undefined };

  const probes: PricedDirection[] = [];
  const grid: PricedDirection[] = [];
  const simplexResults: { cost: number; point: number[] }[] = [];
  const [azimuth = 0, elevation = 0] = toAngles(direction);
  // Grid and each simplex's steps wait their turn on it
  // oxlint-disable no-await-in-loop -- One device: the page draws one direction's shadows at a time, so the probes, the
  for (const [headingTurn, heightTurn] of PROBE_TURNS_DEGREES) {
    const probeDirection = toSunDirection([azimuth + headingTurn, elevation + heightTurn]);
    const { distance, edges } = await price(probeDirection);
    probes.push({ direction: probeDirection, distance, ourEdgeCount: countSetPixels(edges) });
  }
  for (const gridDirection of getSkyGridDirections()) {
    const { distance, edges } = await price(gridDirection);
    grid.push({ direction: gridDirection, distance, ourEdgeCount: countSetPixels(edges) });
  }
  const gridBest = grid.toSorted((firstReading, secondReading) => firstReading.distance - secondReading.distance);
  for (const { direction: startDirection } of gridBest.slice(0, SOLVE_START_COUNT)) {
    const [startAzimuth = 0, startElevation = 0] = toAngles(startDirection);
    const simplexResult = await minimizeNelderMead(
      async (angles) => {
        const [, angleElevation = 0] = angles;
        return angleElevation <= 0 || angleElevation >= 90 ? Infinity : (await price(toSunDirection(angles))).distance;
      },
      [startAzimuth, startElevation],
      [SOLVE_STEP_DEGREES, SOLVE_STEP_DEGREES],
      SOLVE_ITERATION_COUNT,
    );
    simplexResults.push(simplexResult);
  }
  // oxlint-enable no-await-in-loop
  const [simplexBest] = simplexResults.toSorted((firstResult, secondResult) => firstResult.cost - secondResult.cost);
  return { gridBest, probes, solvedDirection: simplexBest ? toSunDirection(simplexBest.point) : undefined };
};
