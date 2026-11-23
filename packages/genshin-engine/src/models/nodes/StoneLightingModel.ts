import type { StoneLightUniforms } from "#src/models/nodes/StoneLightUniforms";
import type { LightingModelDirectInput, LightingModelReflectedLight, Node, NodeBuilder } from "three/webgpu";

import {
  STONE_DARKENING_TOP,
  STONE_HEIGHT_FALLOFF,
  STONE_RAMP_KNOT_COUNT,
  STONE_SHADOW_EXPONENT,
} from "#src/nodes/constants";
import { createSunVisibilityNode } from "#src/nodes/createSunVisibilityNode";
import { diffuseColor, exp, normalView, normalWorld, positionWorld, texture, vec2 } from "three/tsl";
import { LightingModel } from "three/webgpu";

// A node of no type, checked to be a vec3 before it is read as one, so a node of any other type fails the build here
// Rather than in the shader. The type is the builder's to resolve, since a light's direction is an operator whose type
// Three infers from its inputs, so its `nodeType` is still null until the builder reads them
const checkIsVec3Node = (node: Node, builder: NodeBuilder): node is Node<"vec3"> =>
  node.getNodeType(builder) === "vec3";
const readVec3Node = (node: Node, builder: NodeBuilder): Node<"vec3"> => {
  if (!checkIsVec3Node(node, builder)) throw new TypeError(`Expected a vec3 node, got ${node.getNodeType(builder)}`);
  return node;
};

// The game's deferred pass as it lights the stone's G-buffer, with no highlight yet: the sun through the toon ramp,
// Read at a half plus half the face's facing to it scaled by the sun's visibility there raised to a fifth
// (`computeStoneRampCoordinate`), the sky's light as second order spherical harmonics over the world normal
// (`computeStoneHarmonics`), and a fitted light fading with height standing in for the reflection pass's clustered
// Probes up the towers, each times the diffuse colour and all of it darkening with height as the hour sets it
// (`computeStoneDarkening`). The ramp holds the sun's colour, so the sun light lends only its direction and its shadow,
// Read as its shadowed colour against its own
export class StoneLightingModel extends LightingModel {
  readonly stoneLight: StoneLightUniforms;

  constructor(stoneLight: StoneLightUniforms) {
    super();
    this.stoneLight = stoneLight;
  }

  // The share of the light reaching the face's height, as `computeStoneDarkening` reads it
  createDarkeningNode(): Node<"float"> {
    return exp(this.stoneLight.heightDarkening.negate().mul(positionWorld.y.clamp(0, STONE_DARKENING_TOP)));
  }

  // The light's direction and the reflected light's terms are nodes of no type in three's typings, so each is read through
  // `readVec3Node`, which checks it is the vec3 it is read as
  override direct(
    { lightColor, lightDirection, reflectedLight }: LightingModelDirectInput,
    builder: NodeBuilder,
  ): void {
    const { ramp, sunRadiance } = this.stoneLight;
    const visibility = createSunVisibilityNode(lightColor, sunRadiance);
    const coordinate = normalView
      .dot(readVec3Node(lightDirection, builder))
      .mul(visibility.pow(STONE_SHADOW_EXPONENT))
      .mul(0.5)
      .add(0.5);
    // Each knot's texel centre, so the ramp's ends are its first and last knots
    const rampU = coordinate
      .mul(STONE_RAMP_KNOT_COUNT - 1)
      .add(0.5)
      .div(STONE_RAMP_KNOT_COUNT);
    readVec3Node(reflectedLight.directDiffuse, builder).addAssign(
      texture(ramp, vec2(rampU, 0.5)).rgb.mul(diffuseColor.rgb).mul(this.createDarkeningNode()),
    );
  }

  override indirect(builder: NodeBuilder): void {
    const { harmonics, heightFade } = this.stoneLight;
    const { x, y, z } = normalWorld;
    const ambient = harmonics
      .element(0)
      .add(harmonics.element(1).mul(x))
      .add(harmonics.element(2).mul(y))
      .add(harmonics.element(3).mul(z))
      .add(harmonics.element(4).mul(x.mul(y)))
      .add(harmonics.element(5).mul(y.mul(z)))
      .add(harmonics.element(6).mul(x.mul(z)))
      .add(harmonics.element(7).mul(x.mul(x).sub(z.mul(z))))
      .add(harmonics.element(8).mul(y.mul(y).mul(3).sub(1)))
      .add(heightFade.mul(positionWorld.y.mul(-STONE_HEIGHT_FALLOFF).exp()));
    // Three types the builder's context as `unknown`, so it is the one cast left here: the lighting context it holds has
    // The reflected light, and three's typings offer no narrower type to check it against
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- @types/three declares the builder's `context` as `unknown`, so the lighting context it holds is asserted to the reflected light it carries
    const { reflectedLight } = builder.context as { reflectedLight: LightingModelReflectedLight };
    readVec3Node(reflectedLight.indirectDiffuse, builder).addAssign(
      ambient.mul(diffuseColor.rgb).mul(this.createDarkeningNode()),
    );
  }
}
