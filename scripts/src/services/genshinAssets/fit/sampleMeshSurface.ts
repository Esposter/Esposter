import type { MeshSample } from "#src/models/genshinAssets/fit/MeshSample";
import type { Vector } from "#src/models/shared/Vector";

import { Triangle, Vector3 } from "three";

// Points spread over a mesh's surface by area, each with its face's normal and where on its face it lies: a face is
// Drawn with a chance in proportion to its area, then a point uniformly within it, so a large face is read as often as
// Its share of the surface
export const sampleMeshSurface = (
  vertices: readonly Vector[],
  faces: readonly Vector[],
  count: number,
  random: () => number,
): MeshSample[] => {
  const triangle = new Triangle();
  const cumulativeAreas: number[] = [];
  let totalArea = 0;
  const setTriangle = ([first, second, third]: Vector): Triangle =>
    triangle.set(
      new Vector3(...(vertices[first] ?? [0, 0, 0])),
      new Vector3(...(vertices[second] ?? [0, 0, 0])),
      new Vector3(...(vertices[third] ?? [0, 0, 0])),
    );
  for (const face of faces) {
    totalArea += setTriangle(face).getArea();
    cumulativeAreas.push(totalArea);
  }
  const point = new Vector3();
  const normal = new Vector3();
  return Array.from({ length: count }, (): MeshSample => {
    const target = random() * totalArea;
    let low = 0;
    let high = cumulativeAreas.length - 1;
    while (low < high) {
      const middle = Math.floor((low + high) / 2);
      if ((cumulativeAreas[middle] ?? 0) < target) low = middle + 1;
      else high = middle;
    }
    const { a, b, c } = setTriangle(faces[low] ?? [0, 0, 0]);
    let u = random();
    let v = random();
    if (u + v > 1) {
      u = 1 - u;
      v = 1 - v;
    }
    point.copy(a).addScaledVector(b.clone().sub(a), u).addScaledVector(c.clone().sub(a), v);
    triangle.getNormal(normal);
    return { face: low, normal: normal.toArray(), point: point.toArray(), weights: [1 - u - v, u, v] };
  });
};
