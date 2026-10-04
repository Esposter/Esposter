import type { StoneLightUniforms } from "#src/nodes/StoneLightUniforms";
import type { LightingModelDirectInput, LightingModelReflectedLight, Node, NodeBuilder } from "three/webgpu";

import { STONE_RAMP_KNOT_COUNT, STONE_SHADOW_EXPONENT } from "#src/nodes/constants";
import { createSunVisibilityNode } from "#src/nodes/createSunVisibilityNode";
import { diffuseColor, normalView, normalWorld, texture, vec2 } from "three/tsl";
import { LightingModel } from "three/webgpu";

// The game's deferred pass as it lights the stone's G-buffer, with no highlight yet: the sun through the toon ramp,
// Read at a half plus half the face's facing to it scaled by the sun's visibility there raised to a fifth
// (`computeStoneRampCoordinate`), and the sky's light as second order spherical harmonics over the world normal
// (`computeStoneHarmonics`), each times the diffuse colour. The ramp holds the sun's colour, so the sun light lends only
// Its direction and its shadow, read as its shadowed colour against its own
export class StoneLightingModel extends LightingModel {
  readonly stoneLight: StoneLightUniforms;

  constructor(stoneLight: StoneLightUniforms) {
    super();
    this.stoneLight = stoneLight;
  }

  // Three types the light's data and its builder's context loosely, so each is read as the node it is
  override direct({ lightColor, lightDirection, reflectedLight }: LightingModelDirectInput): void {
    const { ramp, sunRadiance } = this.stoneLight;
    const visibility = createSunVisibilityNode(lightColor, sunRadiance);
    const coordinate = normalView
      .dot(lightDirection as Node<"vec3">)
      .mul(visibility.pow(STONE_SHADOW_EXPONENT))
      .mul(0.5)
      .add(0.5);
    // Each knot's texel centre, so the ramp's ends are its first and last knots
    const rampU = coordinate
      .mul(STONE_RAMP_KNOT_COUNT - 1)
      .add(0.5)
      .div(STONE_RAMP_KNOT_COUNT);
    (reflectedLight.directDiffuse as Node<"vec3">).addAssign(texture(ramp, vec2(rampU, 0.5)).rgb.mul(diffuseColor.rgb));
  }

  override indirect(builder: NodeBuilder): void {
    const { harmonics } = this.stoneLight;
    const { x, y, z } = normalWorld;
    const sky = harmonics
      .element(0)
      .add(harmonics.element(1).mul(x))
      .add(harmonics.element(2).mul(y))
      .add(harmonics.element(3).mul(z))
      .add(harmonics.element(4).mul(x.mul(y)))
      .add(harmonics.element(5).mul(y.mul(z)))
      .add(harmonics.element(6).mul(x.mul(z)))
      .add(harmonics.element(7).mul(x.mul(x).sub(z.mul(z))))
      .add(harmonics.element(8).mul(y.mul(y).mul(3).sub(1)));
    const { reflectedLight } = builder.context as { reflectedLight: LightingModelReflectedLight };
    (reflectedLight.indirectDiffuse as Node<"vec3">).addAssign(sky.mul(diffuseColor.rgb));
  }
}
