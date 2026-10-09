import type { Impostor } from "genshin-engine";
import type { BufferGeometry } from "three";
import type { Renderer } from "three/webgpu";

import { bakeImpostor, createLeafShapeNode, IMPOSTOR_RESOLUTION } from "genshin-engine";

// A tree's impostor baked from its own bark and leaf meshes in their colours, so a tree is drawn as one card where the
// Mesh is too far to read, whether it is one tree's own or a whole row of them drawn instanced
export const bakeTreeImpostor = (
  renderer: Renderer,
  branchGeometry: BufferGeometry,
  leafGeometry: BufferGeometry,
  barkColor: string,
  leafColor: string,
): Impostor =>
  bakeImpostor(
    renderer,
    [
      { color: barkColor, geometry: branchGeometry },
      { color: leafColor, geometry: leafGeometry, opacityNode: createLeafShapeNode() },
    ],
    IMPOSTOR_RESOLUTION,
  );
