import type { HeightfieldOptions } from "#src/terrain/HeightfieldOptions";

import { computeHeightfield } from "#src/terrain/computeHeightfield";
import { BufferAttribute, BufferGeometry } from "three";

export const createHeightfieldGeometry = (heightfieldOptions: HeightfieldOptions): BufferGeometry => {
  const { colors, indices, normals, positions } = computeHeightfield(heightfieldOptions);
  const heightfieldGeometry = new BufferGeometry();
  heightfieldGeometry.setAttribute("position", new BufferAttribute(positions, 3));
  heightfieldGeometry.setAttribute("normal", new BufferAttribute(normals, 3));
  heightfieldGeometry.setAttribute("color", new BufferAttribute(colors, 3));
  heightfieldGeometry.setIndex(new BufferAttribute(indices, 1));
  heightfieldGeometry.computeBoundingSphere();
  return heightfieldGeometry;
};
