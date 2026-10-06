import type { StoneLightUniforms } from "#src/models/nodes/StoneLightUniforms";
import type { Node } from "three/webgpu";

import { StoneLightingModel } from "#src/models/nodes/StoneLightingModel";
import { STONE_MASK_OUTPUT } from "#src/nodes/constants";
import { float, mrt, output } from "three/tsl";
import { NodeMaterial } from "three/webgpu";

// A node material lit by the game's deferred pass over the stone (`StoneLightingModel`) from the scene's shared stone
// Light, with the emissive node its base class already adds after lighting, which three's types declare only on the
// Standard material. It marks itself in the stone's mask beside its colour, so the haze draws it under the stone's
// Own colours where the scene pass writes the mask; its outputs carry its colour too, since a pass naming no outputs
// Of its own draws a material's alone
export class StoneNodeMaterial extends NodeMaterial {
  emissiveNode: Node | null = null;
  readonly stoneLight: StoneLightUniforms;

  constructor(stoneLight: StoneLightUniforms) {
    super();
    this.lights = true;
    this.stoneLight = stoneLight;
    this.mrtNode = mrt({ output, [STONE_MASK_OUTPUT]: float(1) });
  }

  override setupLightingModel(): StoneLightingModel {
    return new StoneLightingModel(this.stoneLight);
  }
}
