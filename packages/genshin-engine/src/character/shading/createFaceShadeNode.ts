import type { FaceDraw } from "#src/models/character/FaceDraw";
import type { Texture } from "three";
import type { Node } from "three/webgpu";

import { clamp, float, max, min, saturate, select, smoothstep, texture, uv, vec2 } from "three/tsl";

// The face map's coordinate: its u mirrored where the face is flipped, its v as it is
const createFaceUv = (flip: Node<"float">): Node<"vec2"> =>
  vec2(select(flip.greaterThan(0.5), float(1).sub(uv().x), uv().x), uv().y);

// The face's shade: the face map's texel against a window of the softness around the draw's threshold, smoothed, so a face
// Map reading at or past the window's top lights the face, and a face with no map is lit
export const createFaceShadeNode = (
  faceMap: Texture | undefined,
  softness: number,
  { flip, threshold }: FaceDraw,
): Node<"float"> => {
  const window = max(float(softness), float(1e-6));
  const low = clamp(threshold.sub(window), 1e-4, 0.9989);
  const high = min(threshold.add(window), 0.9999);
  const faceTexel = faceMap ? texture(faceMap, createFaceUv(flip)).r : float(1);
  return smoothstep(0, 1, saturate(faceTexel.sub(low).div(high.sub(low))));
};
