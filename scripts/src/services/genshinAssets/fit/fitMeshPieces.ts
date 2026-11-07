import type { Vector } from "#src/models/shared/Vector";
import type { StatueStack } from "genshin-engine";

import { createNearestColourReader } from "#src/services/genshinAssets/fit/createNearestColourReader";
import { fitStatueComponent } from "#src/services/genshinAssets/fit/fitStatueComponent";
import { sampleMeshSurface } from "#src/services/genshinAssets/fit/sampleMeshSurface";
import { splitMeshComponents } from "#src/services/genshinAssets/fit/splitMeshComponents";
import {
  STATUE_COLOUR_NEAREST_COUNT,
  STATUE_FIT_SAMPLE_COUNT,
  STATUE_FIT_SEED,
  STATUE_SCORE_SAMPLE_COUNT,
} from "#src/services/genshinAssets/shared/constants";
import { createSeededRandom } from "genshin-engine";

// A mesh as the statue kit's stacks, a piece at a time: the pieces its triangles join into (`splitMeshComponents`), each
// Fitted as one upright stack or as blades by `fitStatueComponent`, with the same seed a piece so a refit changes
// Nothing. `readFaceColour` gives the colour, in linear light, at a point on a face of the mesh, the face by its index
// Among `faces` and the point by its weights over the face's corners; a stack's vertices take the mean of the piece's
// Points nearest them. Returns each piece's stacks with the score they were chosen at
export const fitMeshPieces = (
  vertices: readonly Vector[],
  faces: readonly Vector[],
  readFaceColour: (face: number, weights: Readonly<Vector>) => Vector,
): { score: number; stacks: StatueStack[] }[] =>
  splitMeshComponents(vertices, faces).map((pieceFaceIndices) => {
    const pieceFaces = pieceFaceIndices.map((face): Vector => faces[face] ?? [0, 0, 0]);
    const random = createSeededRandom(STATUE_FIT_SEED);
    const pointSamples = sampleMeshSurface(vertices, pieceFaces, STATUE_FIT_SAMPLE_COUNT, random);
    const points = pointSamples.map(({ point }) => point);
    const colours = pointSamples.map(({ face, weights }) => readFaceColour(pieceFaceIndices[face] ?? 0, weights));
    const samples = sampleMeshSurface(vertices, pieceFaces, STATUE_SCORE_SAMPLE_COUNT, random);
    return fitStatueComponent(
      points,
      samples,
      random,
      createNearestColourReader(points, colours, STATUE_COLOUR_NEAREST_COUNT),
    );
  });
