import type { StoneLightUniforms } from "#src/nodes/StoneLightUniforms";
import type { Node } from "three/webgpu";

import { StoneLightingModel } from "#src/nodes/StoneLightingModel";
import { NodeMaterial } from "three/webgpu";

// A node material lit by the game's deferred pass over the stone (`StoneLightingModel`) from the scene's shared stone
// Light, with the emissive node its base class already adds after lighting, which three's types declare only on the
// Standard material
export class StoneNodeMaterial extends NodeMaterial {
  emissiveNode: Node | null = null;
  readonly stoneLight: StoneLightUniforms;

  constructor(stoneLight: StoneLightUniforms) {
    super();
    this.lights = true;
    this.stoneLight = stoneLight;
  }

  override setupLightingModel(): StoneLightingModel {
    return new StoneLightingModel(this.stoneLight);
  }
}
