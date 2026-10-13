import type { Node } from "three/webgpu";

import { BackSide } from "three";
import {
  cameraProjectionMatrix,
  float,
  modelViewMatrix,
  normalize,
  normalLocal,
  positionLocal,
  tangentLocal,
  vec3,
  vec4,
} from "three/tsl";
import { NodeMaterial } from "three/webgpu";

// An outline's material: the mesh pushed out along its normal by the thickness, in screen space so its width holds, and
// Drawn from behind in the colour given. Three builds the same material per toon material, which the outline pass shares
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

// The game's outline material, moved as its vertex program moves a vertex, in view space before the projection: the vertex
// Goes along its ray from the eye by the offset, then its xy along the view tangent's screen direction by the width
// (Exact on both forms, as the program's operators read them). The game keeps a vertex's outline normal in its tangent, and
// The tangent is carried to view space by the model view matrix itself, since three's view normal and tangent turn
// Inward on a back side, which would push the outline into the body. The width is the program's own, so it is not scaled
// By the scene's thickness
export const createGameOutlineMaterial = (
  colorNode: Node<"vec4">,
  widthNode: Node<"float">,
  offsetNode: Node<"float">,
): NodeMaterial => {
  const material = Object.assign(new NodeMaterial(), { isMeshToonOutlineMaterial: true });
  material.name = "Toon_Outline";
  material.side = BackSide;
  const viewPosition = modelViewMatrix.mul(vec4(positionLocal, 1)).xyz;
  const offsetPosition = viewPosition.add(normalize(viewPosition).mul(offsetNode));
  const viewTangent = modelViewMatrix.mul(vec4(tangentLocal, 0)).xyz;
  const pushDirection = normalize(vec3(viewTangent.xy, float(0.01))).xy;
  const pushedPosition = vec3(offsetPosition.xy.add(pushDirection.mul(widthNode)), offsetPosition.z);
  material.vertexNode = cameraProjectionMatrix.mul(vec4(pushedPosition, 1));
  material.colorNode = colorNode;
  return material;
};
