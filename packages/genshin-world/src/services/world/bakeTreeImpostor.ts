import type { Impostor } from "genshin-engine";
import type { BufferGeometry } from "three";
import type { Renderer } from "three/webgpu";

import { BARK_COLOR, LEAF_COLOR } from "#src/services/windrise/constants";
import { bakeImpostor, createLeafShapeNode, IMPOSTOR_RESOLUTION } from "genshin-engine";

// A tree's impostor baked from its own bark and leaf meshes, so a tree is drawn as one card where the mesh is too far
// To read, whether it is one tree's own or a whole row of them drawn instanced
export const bakeTreeImpostor = (
  renderer: Renderer,
  branchGeometry: BufferGeometry,
  leafGeometry: BufferGeometry,
): Impostor =>
  bakeImpostor(
    renderer,
    [
      { color: BARK_COLOR, geometry: branchGeometry },
      { color: LEAF_COLOR, geometry: leafGeometry, opacityNode: createLeafShapeNode() },
    ],
    IMPOSTOR_RESOLUTION,
  );
