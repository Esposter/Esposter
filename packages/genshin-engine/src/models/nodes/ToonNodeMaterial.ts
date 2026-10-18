import type { ToonEdge } from "#src/models/nodes/ToonEdge";
import type { MeshToonNodeMaterialParameters, Node, Texture } from "three/webgpu";

import { MeshToonNodeMaterial } from "three/webgpu";

// Three's toon material with the emissive node its base class already adds after lighting, which three's types
// Declare only on the standard material; the rim is written there so it lights on top of the ramp. Three's outline
// Pass outlines a material by its toon flag alone, so ground that is not outlined, as the game draws none around its
// Terrain, clears the flag while keeping the toon lighting. A material outlined with its own edge is drawn in that edge's
// Colour and width, and its sphere map is held here so its image is released with the material
export class ToonNodeMaterial extends MeshToonNodeMaterial {
  edge?: ToonEdge;
  emissiveNode: Node | null = null;
  // The matrix a placed copy is drawn by, read by its outline as by its fill, so the two stay in one place
  instanceMatrix?: Node<"mat4">;
  readonly isMeshToonMaterial: boolean;
  override readonly isMeshToonNodeMaterial: boolean;
  sphereMap?: Texture;

  constructor(parameters: MeshToonNodeMaterialParameters, isOutlined: boolean, edge?: ToonEdge) {
    super(parameters);
    this.edge = edge;
    this.isMeshToonMaterial = isOutlined;
    this.isMeshToonNodeMaterial = isOutlined;
  }
}
