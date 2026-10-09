import type { MeshSample } from "#src/models/genshinAssets/fit/MeshSample";
import type { Vector } from "#src/models/shared/Vector";
import type { StatueStack } from "genshin-engine";

import { clusterVectors } from "#src/services/genshinAssets/fit/clusterVectors";
import { computeSurfaceError } from "#src/services/genshinAssets/fit/computeSurfaceError";
import { fitStatueStack } from "#src/services/genshinAssets/fit/fitStatueStack";
import { sampleMeshSurface } from "#src/services/genshinAssets/fit/sampleMeshSurface";
import { seedClusterMeans } from "#src/services/genshinAssets/fit/seedClusterMeans";
import {
  STATUE_ANGLE_COUNT,
  STATUE_BLADE_ANGLE_COUNT,
  STATUE_BLADE_COUNTS,
  STATUE_BLADE_MIN_SAMPLES,
  STATUE_FIT_DISTANCE_METRES,
  STATUE_SCORE_SAMPLE_COUNT,
  STATUE_SECTION_HEIGHT,
} from "#src/services/genshinAssets/shared/constants";
import { SHAPE_NORMAL_GATE_DEGREES } from "#src/services/genshinParity/passes/constants";
import { computeStatueSurface } from "genshin-engine";
import { Quaternion, Vector3 } from "three";

const UP: Vector = [0, 1, 0];
// A candidate's stacks drawn as the kit draws them, their surface's triangles in the statue's frame
const toStackMesh = (stacks: readonly StatueStack[]): { faces: Vector[]; vertices: Vector[] } => {
  const faces: Vector[] = [];
  const vertices: Vector[] = [];
  const vertex = new Vector3();
  for (const { position, rotation, sections } of stacks) {
    const { indices, positions } = computeStatueSurface(sections);
    const turn = new Quaternion(...rotation);
    const foot = new Vector3(...position);
    const offset = vertices.length;
    for (let index = 0; index < positions.length; index += 3)
      vertices.push(
        vertex
          .set(positions[index] ?? 0, positions[index + 1] ?? 0, positions[index + 2] ?? 0)
          .applyQuaternion(turn)
          .add(foot)
          .toArray(),
      );
    for (let index = 0; index < indices.length; index += 3)
      faces.push([
        offset + (indices[index] ?? 0),
        offset + (indices[index + 1] ?? 0),
        offset + (indices[index + 2] ?? 0),
      ]);
  }
  return { faces, vertices };
};
// A component's points split into `count` blades by k-means, each blade a stack along its own length; a blade too few
// Points reach is left out
const fitBlades = (
  points: readonly Vector[],
  count: number,
  random: () => number,
  readColour: (point: Readonly<Vector>) => number,
): StatueStack[] => {
  const clusters = clusterVectors(points, seedClusterMeans(points, count, random));
  return Array.from({ length: count }, (_blade, blade) =>
    points.filter((_point, index) => clusters[index] === blade),
  ).flatMap((bladePoints) =>
    bladePoints.length < STATUE_BLADE_MIN_SAMPLES
      ? []
      : [
          fitStatueStack(bladePoints, {
            angleCount: STATUE_BLADE_ANGLE_COUNT,
            readColour,
            sectionHeight: STATUE_SECTION_HEIGHT,
          }),
        ],
  );
};
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
