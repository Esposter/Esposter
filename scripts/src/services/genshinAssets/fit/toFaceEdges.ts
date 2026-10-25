import type { Vector } from "#src/models/shared/Vector";

// Every edge of a piece's faces, each as the two vertices it runs between, in the order the faces name them
export const toFaceEdges = (pieceFaces: readonly Vector[]): [number, number][] =>
  pieceFaces.flatMap((face) => face.map((first, corner): [number, number] => [first, face[(corner + 1) % 3] ?? first]));
