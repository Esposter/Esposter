import type { ToonMaterialOptions } from "#src/nodes/ToonMaterialOptions";
import type { ToonNodeMaterial } from "#src/nodes/ToonNodeMaterial";
import type { WindUniforms } from "#src/wind/WindUniforms";

import { createToonMaterial } from "#src/nodes/createToonMaterial";
import { createWindNode } from "#src/nodes/createWindNode";
import { DoubleSide } from "three";
import { float, hash, modelWorldMatrix, positionLocal, sin, step, time, uv, vec3, vec4 } from "three/tsl";

const LEAF_ALPHA_TEST = 0.5;
// How far a crown leans for a unit of wind, per metre up the tree, and how far each card flutters on its own
const SWAY_PER_WIND = 0.03;
const FLUTTER = 0.06;
// A leaf card cut to a pointed oval in the shader, so a crown is built from plain quads and no leaf texture is
// Authored or loaded. The card's normals are the crown's, bent outward by the generator, so the lighting reads a soft
// Mass rather than each card. In a wind the crown leans downwind, more the higher it is, and each patch of cards
// Flutters on its own phase; the lean is the position node, so the crown's shadow sways with it
export const createLeafMaterial = (
  toonMaterialOptions: ToonMaterialOptions,
  windUniforms?: WindUniforms,
): ToonNodeMaterial => {
  const leafMaterial = createToonMaterial(toonMaterialOptions);
  const centered = uv().sub(0.5).mul(2);
  // Narrower toward the tip and the stem, so the silhouette is a leaf rather than a disc
  const width = float(1).sub(centered.y.abs().pow(2)).mul(0.8);
  leafMaterial.opacityNode = step(0, width.sub(centered.x.abs()));
  leafMaterial.alphaTest = LEAF_ALPHA_TEST;
  leafMaterial.side = DoubleSide;
  if (windUniforms) {
    const worldPosition = modelWorldMatrix.mul(vec4(positionLocal, 1)).xyz;
    const lean = createWindNode(windUniforms, worldPosition.xz).mul(positionLocal.y.mul(SWAY_PER_WIND));
    const phase = hash(worldPosition.x.mul(12.9).add(worldPosition.z.mul(78.2)).floor()).mul(Math.PI * 2);
    const flutter = sin(time.mul(3).add(phase)).mul(FLUTTER).mul(windUniforms.strength.add(windUniforms.gustStrength));
    leafMaterial.positionNode = positionLocal.add(vec3(lean.x, flutter, lean.y));
  }
  return leafMaterial;
};
