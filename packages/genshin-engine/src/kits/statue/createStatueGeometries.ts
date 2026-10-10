import type { StatuePart } from "#src/models/kits/statue/StatuePart";
import type { StatueStack } from "#src/models/kits/statue/StatueStack";

import { mergeGeometryParts } from "#src/kits/mergeGeometryParts";
import { computeStatueSurface } from "#src/kits/statue/computeStatueSurface";
import { BufferAttribute, BufferGeometry, Quaternion } from "three";

// One stack of a statue's part as its radial stack, turned onto its own axis and standing at its own place in the
// Statue's frame
const createStackGeometry = ({
  position: [x = 0, y = 0, z = 0],
  rotation: [rotationX = 0, rotationY = 0, rotationZ = 0, rotationW = 1],
  sections,
}: StatueStack): BufferGeometry => {
  const { indices, positions } = computeStatueSurface(sections);
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setIndex(new BufferAttribute(indices, 1));
  geometry.computeVertexNormals();
  return geometry
    .applyQuaternion(new Quaternion(rotationX, rotationY, rotationZ, rotationW).normalize())
    .translate(x, y, z);
};
// A statue as radial stacks, grouped by the export part each came from: every stack of one part merged into one
// Geometry, so each part is drawn in its own material. The stacks are fitted from the game's own meshes, so the
// Silhouette is theirs and the surface is ours, its normals read off the surface itself
export const createStatueGeometries = (parts: readonly StatuePart[]): Record<string, BufferGeometry> =>
  Object.fromEntries(
    Object.entries(Object.groupBy(parts, ({ part }) => part)).map(([part, stacks]) => [
      part,
      mergeGeometryParts((stacks ?? []).map((stack) => createStackGeometry(stack))),
    ]),
  );
