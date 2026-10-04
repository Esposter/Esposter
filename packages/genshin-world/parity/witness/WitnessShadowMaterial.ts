import type { Color } from "three";
import type { UniformNode } from "three/webgpu";

import { WitnessShadowLightingModel } from "#parity/witness/WitnessShadowLightingModel";
import { NodeMaterial } from "three/webgpu";

// The material the shadow target draws a part with: lit by the scene's lights, its light the sun's visibility alone
export class WitnessShadowMaterial extends NodeMaterial {
  readonly sunRadiance: UniformNode<"color", Color>;

  constructor(sunRadiance: UniformNode<"color", Color>) {
    super();
    this.lights = true;
    this.toneMapped = false;
    this.sunRadiance = sunRadiance;
  }

  override setupLightingModel(): WitnessShadowLightingModel {
    return new WitnessShadowLightingModel(this.sunRadiance);
  }
}
