import type { ToonMaterialOptions } from "#src/models/nodes/ToonMaterialOptions";
import type { ToonNodeMaterial } from "#src/models/nodes/ToonNodeMaterial";
import type { WindUniforms } from "#src/models/wind/WindUniforms";
import type { Node } from "three/webgpu";

import { createLeafShapeNode } from "#src/nodes/createLeafShapeNode";
import { createToonMaterial } from "#src/nodes/createToonMaterial";
import { createWindNode } from "#src/nodes/createWindNode";
import { DoubleSide } from "three";
import { hash, modelWorldMatrix, normalViewGeometry, positionLocal, sin, time, vec3, vec4 } from "three/tsl";

// How far a crown leans for a unit of wind, per metre up the tree, and how far each card flutters on its own
const SWAY_PER_WIND = 0.03;
const FLUTTER = 0.06;
// A leaf card cut to a pointed oval in the shader (`createLeafShapeNode`), and by the host's own mask where it gives one
// (a tree's fade). The cut is a mask node, which the shadow pass cuts by too where it reads no opacity, so a card casts
// Its leaf rather than its quad. The card's normals are the crown's, bent outward by the generator, so the lighting
// Reads a soft mass rather than each card. In a wind the crown leans downwind, more the higher it is, and each patch of
// Cards flutters on its own phase; the lean is the position node, so the crown's shadow sways with it
export const createLeafMaterial = (
  toonMaterialOptions: ToonMaterialOptions,
  windUniforms?: WindUniforms,
  maskNode?: Node<"bool">,
): ToonNodeMaterial => {
  // Not outlined: the outline pass draws a card's back face inflated and unmasked, a solid patch in the outline colour
  const leafMaterial = createToonMaterial({ ...toonMaterialOptions, isOutlined: false });
  const leafShape = createLeafShapeNode();
  leafMaterial.maskNode = maskNode ? leafShape.and(maskNode) : leafShape;
  leafMaterial.side = DoubleSide;
  // The crown's normal from either face: three turns a double-sided face's normal round on its back, which turned half
  // The cards inward, where the rim lit them pale
  leafMaterial.normalNode = normalViewGeometry;
  if (windUniforms) {
    const worldPosition = modelWorldMatrix.mul(vec4(positionLocal, 1)).xyz;
    const lean = createWindNode(windUniforms, worldPosition.xz).mul(positionLocal.y.mul(SWAY_PER_WIND));
    const phase = hash(worldPosition.x.mul(12.9).add(worldPosition.z.mul(78.2)).floor()).mul(Math.PI * 2);
    const flutter = sin(time.mul(3).add(phase)).mul(FLUTTER).mul(windUniforms.strength.add(windUniforms.gustStrength));
    leafMaterial.positionNode = positionLocal.add(vec3(lean.x, flutter, lean.y));
  }
  return leafMaterial;
};
