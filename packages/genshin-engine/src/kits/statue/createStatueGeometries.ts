import type { StatuePart } from "#src/models/kits/statue/StatuePart";

import { mergeGeometryParts } from "#src/kits/mergeGeometryParts";
import { computeStatueSurface } from "#src/kits/statue/computeStatueSurface";
import { BufferAttribute, BufferGeometry } from "three";

// One run of a statue's part as its radial stack, standing at its own place in the statue's frame
const createRunGeometry = ({ position: [x = 0, y = 0, z = 0], sections }: StatuePart): BufferGeometry => {
  const { indices, positions } = computeStatueSurface(sections);
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setIndex(new BufferAttribute(indices, 1));
  geometry.computeVertexNormals();
  return geometry.translate(x, y, z);
};
// A statue as radial stacks, grouped by the export part each came from: every run of one part merged into one geometry,
// So each part is drawn in its own material. The parts are fitted from the game's own meshes, so the silhouette is theirs
// And the surface is ours, its normals read off the surface itself
export const createStatueGeometries = (parts: readonly StatuePart[]): Record<string, BufferGeometry> =>
  Object.fromEntries(
    Object.entries(Object.groupBy(parts, ({ part }) => part)).map(([part, runs]) => [
      part,
      mergeGeometryParts((runs ?? []).map(createRunGeometry)),
    ]),
  );
