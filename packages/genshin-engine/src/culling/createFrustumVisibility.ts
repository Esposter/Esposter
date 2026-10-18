import type { Matrix4 } from "three";
import type { Node, UniformNode } from "three/webgpu";

import { CULLING_FRUSTUM_MARGIN } from "#src/culling/constants";
import { step, vec4 } from "three/tsl";

// Whether a point of the model stands in the view, one for in and zero for out. The point is taken in the clip space the
// model-to-clip matrix gives it: in front of the near plane, within the sides and between the planes, each widened by
// the margin
export const createFrustumVisibility = (
  clipFromModel: UniformNode<"mat4", Matrix4>,
  point: Node<"vec3">,
): Node<"float"> => {
  const clip = clipFromModel.mul(vec4(point, 1));
  const limit = clip.w.mul(1 + CULLING_FRUSTUM_MARGIN);
  return step(0, clip.w)
    .mul(step(clip.x.abs(), limit))
    .mul(step(clip.y.abs(), limit))
    .mul(step(0, clip.z))
    .mul(step(clip.z, limit));
};
