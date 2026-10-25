import type { MeshSample } from "#src/models/genshinAssets/fit/MeshSample";
import type { Vector } from "#src/models/shared/Vector";
import type { StatueStack } from "genshin-engine";

import { computeSurfaceError } from "#src/services/genshinAssets/fit/computeSurfaceError";
import { fitBlades } from "#src/services/genshinAssets/fit/fitBlades";
import { fitStatueStack } from "#src/services/genshinAssets/fit/fitStatueStack";
import { sampleMeshSurface } from "#src/services/genshinAssets/fit/sampleMeshSurface";
import { toStackMesh } from "#src/services/genshinAssets/fit/toStackMesh";
import {
  STATUE_ANGLE_COUNT,
  STATUE_BLADE_COUNTS,
  STATUE_FIT_DISTANCE_METRES,
  STATUE_SCORE_SAMPLE_COUNT,
  STATUE_SECTION_HEIGHT,
} from "#src/services/genshinAssets/shared/constants";
import { SHAPE_NORMAL_GATE_DEGREES } from "#src/services/genshinParity/passes/constants";

const UP: Vector = [0, 1, 0];

// One piece of a statue's mesh as the statue kit's stacks: one upright stack, as a column, a dish or a robe stands, or
// The piece split into blades, as a leaf, a wing's feathers or an arm lie, at each count `STATUE_BLADE_COUNTS` holds,
// Whichever lies nearest the piece's own surface by `computeSurfaceError`, its distance and angle each over what the
// Shape pass holds a stand-in to, so the choice is read from no view and fits the piece, not one camera. `points` are
// The piece's surface samples the stacks are fitted to, `samples` the ones each candidate is scored against, and
// `readColour` the piece's colour where each of a stack's vertices stands
export const fitStatueComponent = (
  points: readonly Vector[],
  samples: readonly MeshSample[],
  random: () => number,
  readColour: (point: Readonly<Vector>) => number,
): { score: number; stacks: StatueStack[] } => {
  const candidates = [
    [
      fitStatueStack(points, {
        angleCount: STATUE_ANGLE_COUNT,
        axis: UP,
        readColour,
        sectionHeight: STATUE_SECTION_HEIGHT,
      }),
    ],
    ...STATUE_BLADE_COUNTS.map((count) => fitBlades(points, count, random, readColour)),
  ];
  return candidates
    .map((stacks) => {
      const { faces, vertices } = toStackMesh(stacks);
      const { angle, distance } = computeSurfaceError(
        samples,
        sampleMeshSurface(vertices, faces, STATUE_SCORE_SAMPLE_COUNT, random),
      );
      return { score: distance / STATUE_FIT_DISTANCE_METRES + angle / SHAPE_NORMAL_GATE_DEGREES, stacks };
    })
    .reduce((best, candidate) => (candidate.score < best.score ? candidate : best));
};
