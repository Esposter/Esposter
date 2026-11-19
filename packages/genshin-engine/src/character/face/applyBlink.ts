import type { Mesh } from "three";

import { FACE_BLINK_MORPH_NAME, FACE_BLINK_PERIOD_SECONDS, FACE_BLINK_SECONDS } from "#src/character/face/constants";

// Sets the blink morph's influence at a time. The eyes close over the first half of each blink and open over the second,
// And a mesh whose pack named no blink morph has no influence to set, so its face stays still
export const applyBlink = (mesh: Mesh, elapsed: number): void => {
  const index = mesh.morphTargetDictionary?.[FACE_BLINK_MORPH_NAME];
  if (index === undefined || !mesh.morphTargetInfluences) return;
  const phase = elapsed % FACE_BLINK_PERIOD_SECONDS;
  const half = FACE_BLINK_SECONDS / 2;
  mesh.morphTargetInfluences[index] = phase < FACE_BLINK_SECONDS ? 1 - Math.abs(phase - half) / half : 0;
};
