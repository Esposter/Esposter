import type { MeshToonNodeMaterialParameters, Node } from "three/webgpu";

import { MeshToonNodeMaterial } from "three/webgpu";

// Three's toon material with the emissive node its base class already adds after lighting, which three's types
// Declare only on the standard material; the rim is written there so it lights on top of the ramp. Three's outline
// Pass outlines a material by its toon flag alone, so ground that is not outlined, as the game draws none around its
// Terrain, clears the flag while keeping the toon lighting
export class ToonNodeMaterial extends MeshToonNodeMaterial {
  emissiveNode: Node | null = null;
  override readonly isMeshToonNodeMaterial: boolean;

  constructor(parameters: MeshToonNodeMaterialParameters, isOutlined: boolean) {
    super(parameters);
    this.isMeshToonNodeMaterial = isOutlined;
  }
}
