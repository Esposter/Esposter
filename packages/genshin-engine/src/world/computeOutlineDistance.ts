import type { GroundPoint } from "#src/world/GroundPoint";

// How far a point on the ground is from an area's outline, zero inside it: the nearest of its edges' distances, and
// Inside by the even-odd count of edges a ray east from the point crosses. An outline not yet drawn is infinitely far
export const computeOutlineDistance = (outline: readonly GroundPoint[], x: number, z: number): number => {
  let isInside = false;
  let nearestSquared = Infinity;
  for (let index = 0, previousIndex = outline.length - 1; index < outline.length; previousIndex = index++) {
    const start = outline[previousIndex];
    const end = outline[index];
    if (!start || !end) continue;
    if (end.z > z !== start.z > z && x < ((start.x - end.x) * (z - end.z)) / (start.z - end.z) + end.x)
      isInside = !isInside;
    const edgeX = start.x - end.x;
    const edgeZ = start.z - end.z;
    const lengthSquared = edgeX * edgeX + edgeZ * edgeZ;
    const along =
      lengthSquared === 0 ? 0 : Math.min(Math.max(((x - end.x) * edgeX + (z - end.z) * edgeZ) / lengthSquared, 0), 1);
    const offsetX = x - end.x - along * edgeX;
    const offsetZ = z - end.z - along * edgeZ;
    nearestSquared = Math.min(nearestSquared, offsetX * offsetX + offsetZ * offsetZ);
  }
  return isInside ? 0 : Math.sqrt(nearestSquared);
};
