import type { Node } from "three/webgpu";

import { BackSide } from "three";
import { NodeMaterial } from "three/webgpu";
import { cameraProjectionMatrix, float, modelViewMatrix, normalize, normalLocal, positionLocal, vec4 } from "three/tsl";

// An outline's material: the mesh pushed out along its normal by the thickness, in screen space so its width holds, and
// drawn from behind in the colour given. Three builds the same material per toon material, which the outline pass
// Shares
export const createOutlineMaterial = (colorNode: Node<"vec4">, thicknessNode: Node<"float">): NodeMaterial => {
  // Three's outline pass finds its own outline materials by this flag, which NodeMaterial does not type
  const material = Object.assign(new NodeMaterial(), { isMeshToonOutlineMaterial: true });
  material.name = "Toon_Outline";
  material.side = BackSide;
  const outlineNormal = normalLocal.negate();
  const mvp = cameraProjectionMatrix.mul(modelViewMatrix);
  const pos = mvp.mul(vec4(positionLocal, 1));
  const pos2 = mvp.mul(vec4(positionLocal.add(outlineNormal), 1));
  // Subtract pos2 from pos because a back face's normal is negative
  const norm = normalize(pos.sub(pos2));
  material.vertexNode = pos.add(norm.mul(thicknessNode).mul(pos.w));
  material.colorNode = colorNode;
  return material;
};
