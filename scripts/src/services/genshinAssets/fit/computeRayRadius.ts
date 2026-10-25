import type { Outline } from "#src/models/genshinAssets/fit/Outline";

// How far along a ray from the origin the hull's boundary stands, where the ray crosses an edge from a to b; the
// Origin lies inside the hull, so the ray leaves it at the one crossing ahead of it
export const computeRayRadius = (hull: readonly Outline[], angle: number): number => {
  const [directionX, directionZ] = [Math.cos(angle), Math.sin(angle)];
  let radius = 0;
  for (const [index, [startX, startZ]] of hull.entries()) {
    const [endX, endZ] = hull[(index + 1) % hull.length] ?? [startX, startZ];
    const [edgeX, edgeZ] = [endX - startX, endZ - startZ];
    const determinant = edgeX * directionZ - edgeZ * directionX;
    if (Math.abs(determinant) < Number.EPSILON) continue;
    const along = (startZ * edgeX - startX * edgeZ) / determinant;
    const across = (startZ * directionX - startX * directionZ) / determinant;
    if (along >= 0 && across >= 0 && across <= 1) radius = Math.max(radius, along);
  }
  return radius;
};
