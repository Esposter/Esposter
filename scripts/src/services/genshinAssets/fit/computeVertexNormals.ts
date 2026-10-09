import type { Vector } from "#src/models/shared/Vector";

// Each vertex's normal in the game's axes, the unit average of the normals of the faces' corners that meet it, or
// Undefined where no corner names one
export const computeVertexNormals = ({
  faceNormals,
  faces,
  normals,
  vertices,
}: {
  faceNormals: readonly [number, number, number][];
  faces: readonly [number, number, number][];
  normals: readonly Vector[];
  vertices: readonly Vector[];
}): (undefined | Vector)[] => {
  const sums = vertices.map((): Vector => [0, 0, 0]);
  const counts = vertices.map(() => 0);
  for (const [face, corners] of faces.entries())
    for (const [corner, vertexIndex] of corners.entries()) {
      const normal = normals[faceNormals[face]?.[corner] ?? -1];
      const sum = sums[vertexIndex];
      if (!normal || !sum) continue;
      for (const axis of [0, 1, 2] as const) sum[axis] += normal[axis];
      counts[vertexIndex] = (counts[vertexIndex] ?? 0) + 1;
    }
  return sums.map((sum, index) => {
    if (!counts[index]) return undefined;
    const length = Math.hypot(...sum) || 1;
    return [sum[0] / length, sum[1] / length, sum[2] / length];
  });
};
