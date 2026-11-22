import type { Color } from "three";
import type { LightingModelDirectInput, UniformNode } from "three/webgpu";

import { asVec3Node } from "#src/services/scene/asVec3Node";
import { createSunVisibilityNode } from "genshin-engine";
import { vec3 } from "three/tsl";
import { LightingModel } from "three/webgpu";

// The sun's visibility at each pixel (`createSunVisibilityNode`), as `StoneLightingModel` reads it to scale a face's
// Facing. Nothing indirect is drawn, so a pixel the sun never reaches reads zero
export class WitnessShadowLightingModel extends LightingModel {
  readonly sunRadiance: UniformNode<"color", Color>;

  constructor(sunRadiance: UniformNode<"color", Color>) {
    super();
    this.sunRadiance = sunRadiance;
  }

  override direct({ lightColor, reflectedLight }: LightingModelDirectInput): void {
    asVec3Node(reflectedLight.directDiffuse).addAssign(vec3(createSunVisibilityNode(lightColor, this.sunRadiance)));
  }
}
