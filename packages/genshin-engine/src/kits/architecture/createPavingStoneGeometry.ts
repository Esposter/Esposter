import type { PavingStoneShape } from "#src/models/kits/architecture/PavingStoneShape";

import { BufferAttribute, BufferGeometry } from "three";

// A paving stone's prism at its origin: its top and bottom fanned from their centres, and each side two triangles. The
// Triangles are unshared, so the normals computed from them are flat, as a cut stone's faces are, and they wind outward
export const createPavingStoneGeometry = ({ bottom, radii, top }: PavingStoneShape): BufferGeometry => {
  const sideCount = radii.length;
  // Each side is four triangles of three corners, three numbers a corner
  const positions = new Float32Array(sideCount * 4 * 3 * 3);
  let offset = 0;
  const writeCorner = (x: number, height: number, z: number): void => {
    positions[offset] = x;
    positions[offset + 1] = height;
    positions[offset + 2] = z;
    offset += 3;
  };
  const writeSideCorner = (side: number, height: number): void => {
    const angle = (2 * Math.PI * side) / sideCount;
    const radius = radii[side % sideCount] ?? 0;
    writeCorner(radius * Math.cos(angle), height, radius * Math.sin(angle));
  };
  for (let side = 0; side < sideCount; side++) {
    const nextSide = side + 1;
    writeCorner(0, top, 0);
    writeSideCorner(nextSide, top);
    writeSideCorner(side, top);
    writeCorner(0, bottom, 0);
    writeSideCorner(side, bottom);
    writeSideCorner(nextSide, bottom);
    writeSideCorner(side, bottom);
    writeSideCorner(side, top);
    writeSideCorner(nextSide, top);
    writeSideCorner(side, bottom);
    writeSideCorner(nextSide, top);
    writeSideCorner(nextSide, bottom);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  return geometry;
};
