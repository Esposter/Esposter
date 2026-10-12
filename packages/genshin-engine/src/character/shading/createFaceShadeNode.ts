import type { Texture } from "three";
import type { Node } from "three/webgpu";

import { FACE_DEPTH_TERM } from "#src/character/shading/constants";
import { clamp, float, max, min, saturate, smoothstep, texture, uv } from "three/tsl";

// The face's shade: the face map's texel against a window of the softness around the depth term, smoothed, so a face map
// Reading at or past the window's top lights the face, and a face with no map is lit
export const createFaceShadeNode = (faceMap: Texture | undefined, softness: number): Node<"float"> => {
  const window = max(float(softness), float(1e-6));
  const low = clamp(float(FACE_DEPTH_TERM).sub(window), 1e-4, 0.9989);
  const high = min(float(FACE_DEPTH_TERM).add(window), 0.9999);
  const faceTexel = faceMap ? texture(faceMap, uv()).r : float(1);
  return smoothstep(0, 1, saturate(faceTexel.sub(low).div(high.sub(low))));
};
