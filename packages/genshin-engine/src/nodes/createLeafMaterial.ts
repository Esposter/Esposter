import type { ToonMaterialOptions } from "#src/models/nodes/ToonMaterialOptions";
import type { ToonNodeMaterial } from "#src/models/nodes/ToonNodeMaterial";
import type { WindUniforms } from "#src/models/wind/WindUniforms";

import { createLeafShapeNode } from "#src/nodes/createLeafShapeNode";
import { createToonMaterial } from "#src/nodes/createToonMaterial";
import { createWindNode } from "#src/nodes/createWindNode";
import { DoubleSide } from "three";
import { hash, modelWorldMatrix, positionLocal, sin, time, vec3, vec4 } from "three/tsl";

const LEAF_ALPHA_TEST = 0.5;
// How far a crown leans for a unit of wind, per metre up the tree, and how far each card flutters on its own
const SWAY_PER_WIND = 0.03;
const FLUTTER = 0.06;
// A leaf card cut to a pointed oval in the shader (`createLeafShapeNode`). The card's normals are the crown's, bent
// Outward by the generator, so the lighting reads a soft mass rather than each card. In a wind the crown leans
// Downwind, more the higher it is, and each patch of cards flutters on its own phase; the lean is the position node, so
// The crown's shadow sways with it
export const createLeafMaterial = (
  toonMaterialOptions: ToonMaterialOptions,
  windUniforms?: WindUniforms,
): ToonNodeMaterial => {
  const leafMaterial = createToonMaterial(toonMaterialOptions);
  leafMaterial.opacityNode = createLeafShapeNode();
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
