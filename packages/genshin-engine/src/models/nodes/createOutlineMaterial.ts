import type { Node } from "three/webgpu";

import { BackSide } from "three";
import {
  cameraProjectionMatrix,
  modelViewMatrix,
  normalize,
  normalLocal,
  positionLocal,
  transformedNormalView,
  vec4,
} from "three/tsl";
import { NodeMaterial } from "three/webgpu";

// An outline's material: the mesh pushed out along its normal by the thickness, in screen space so its width holds, and
// Drawn from behind in the colour given, and moved along the view-space normal by the offset where one is given, before
// The projection. Three builds the same material per toon material, which the outline pass shares
export const createOutlineMaterial = (
  colorNode: Node<"vec4">,
  thicknessNode: Node<"float">,
  offsetNode?: Node<"float">,
): NodeMaterial => {
  // Three's outline pass finds its own outline materials by this flag, which NodeMaterial does not type
  const material = Object.assign(new NodeMaterial(), { isMeshToonOutlineMaterial: true });
  material.name = "Toon_Outline";
  material.side = BackSide;
  const outlineNormal = normalLocal.negate();
  const mvp = cameraProjectionMatrix.mul(modelViewMatrix);
  const viewPosition = modelViewMatrix.mul(vec4(positionLocal, 1));
  const offsetViewPosition = offsetNode
    ? viewPosition.add(vec4(normalize(transformedNormalView).mul(offsetNode), 0))
    : viewPosition;
  const pos = cameraProjectionMatrix.mul(offsetViewPosition);
  const pos2 = mvp.mul(vec4(positionLocal.add(outlineNormal), 1));
  // Subtract pos2 from pos because a back face's normal is negative
  const norm = normalize(pos.sub(pos2));
  material.vertexNode = pos.add(norm.mul(thicknessNode).mul(pos.w));
  material.colorNode = colorNode;
  return material;
};
