import type { PavingStoneShape } from "#src/models/kits/architecture/PavingStoneShape";

import { BufferAttribute, BufferGeometry } from "three";

type Corner = [number, number, number];

// A paving stone's prism at its origin: its top and bottom fanned from their centres, and each side two triangles. The
// Triangles are unshared, so the normals computed from them are flat, as a cut stone's faces are, and they wind outward
export const createPavingStoneGeometry = ({ bottom, radii, top }: PavingStoneShape): BufferGeometry => {
  const sideCount = radii.length;
  const getCorner = (side: number, height: number): Corner => {
    const angle = (2 * Math.PI * side) / sideCount;
    const radius = radii[side % sideCount] ?? 0;
    return [radius * Math.cos(angle), height, radius * Math.sin(angle)];
  };
  const positions: number[] = [];
  const pushTriangle = (first: Corner, second: Corner, third: Corner): void => {
    positions.push(...first, ...second, ...third);
  };
  const centreTop: Corner = [0, top, 0];
  const centreBottom: Corner = [0, bottom, 0];
  for (let side = 0; side < sideCount; side++) {
    const nextSide = side + 1;
    pushTriangle(centreTop, getCorner(nextSide, top), getCorner(side, top));
    pushTriangle(centreBottom, getCorner(side, bottom), getCorner(nextSide, bottom));
    pushTriangle(getCorner(side, bottom), getCorner(side, top), getCorner(nextSide, top));
    pushTriangle(getCorner(side, bottom), getCorner(nextSide, top), getCorner(nextSide, bottom));
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(positions), 3));
  geometry.computeVertexNormals();
  return geometry;
};
