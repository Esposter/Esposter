import type { GroundCapture } from "#src/models/vegetation/GroundCapture";
import type { Node } from "three/webgpu";

import { float, step, texture, vec2 } from "three/tsl";

// The ground's colour and height at a point of the world, read from the capture, and whether the point stands inside the
// capture at all, since the capture covers only a square round the camera
export const sampleGroundCapture = (
  groundCapture: GroundCapture,
  ground: Node<"vec2">,
): { captured: Node<"vec4">; isInsideCapture: Node<"float"> } => {
  const captureUV = vec2(
    ground.x.sub(groundCapture.center.x).div(groundCapture.size).add(0.5),
    float(0.5).sub(ground.y.sub(groundCapture.center.y).div(groundCapture.size)),
  );
  const captured = texture(groundCapture.renderTarget.texture, captureUV).level(float(0));
  const isInsideCapture = step(0, captureUV.x)
    .mul(step(captureUV.x, 1))
    .mul(step(0, captureUV.y))
    .mul(step(captureUV.y, 1));
  return { captured, isInsideCapture };
};
