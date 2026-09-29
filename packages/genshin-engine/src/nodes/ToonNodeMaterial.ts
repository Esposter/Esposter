import type { Node } from "three/webgpu";

import { MeshToonNodeMaterial } from "three/webgpu";

// Three's toon material with the emissive node its base class already adds after lighting, which three's types
// Declare only on the standard material; the rim is written there so it lights on top of the ramp
export class ToonNodeMaterial extends MeshToonNodeMaterial {
  emissiveNode: Node | null = null;
}
