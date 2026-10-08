import type { StatuePart } from "#src/models/kits/statue/StatuePart";

import { mergeGeometryParts } from "#src/kits/mergeGeometryParts";
import { computeStatueSurface } from "#src/kits/statue/computeStatueSurface";
import { BufferAttribute, BufferGeometry } from "three";

// A statue as radial stacks, each part standing at its own place in the statue's frame, merged into one geometry for one
// Material. The parts are fitted from the game's own meshes, so the silhouette is theirs and the surface is ours, its
// Normals read off the surface itself
export const createStatueGeometry = (parts: readonly StatuePart[]): BufferGeometry =>
  mergeGeometryParts(
    parts.map(({ position: [x = 0, y = 0, z = 0], sections }) => {
      const { indices, positions } = computeStatueSurface(sections);
      const geometry = new BufferGeometry();
      geometry.setAttribute("position", new BufferAttribute(positions, 3));
      geometry.setIndex(new BufferAttribute(indices, 1));
      geometry.computeVertexNormals();
      return geometry.translate(x, y, z);
    }),
  );
