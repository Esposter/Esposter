import { ORIGIN_SHIFT_STEP, ORIGIN_SHIFT_THRESHOLD } from "#src/services/constants";
import { useLoop, useTres } from "@tresjs/core";
import { computeOriginShift } from "genshin-engine";
import { Vector3 } from "three";

// The floating origin: single-precision positions tremble far from the origin, so once the camera has gone a
// Kilometre out the world is moved back under it. The camera is pulled back by the shift, and the world's group, which
// Every placed thing is inside, is offset by the new origin. The origin is the world coordinate the scene's origin
// Stands on, which the terrain adds to the camera to know where it is, and is owned by the screen, whose free camera
// Reads it before the shift is made
export const useFloatingOrigin = (origin: Vector3) => {
  const { camera } = useTres();
  const { onBeforeRender } = useLoop();
  const worldOffset = shallowRef<[number, number, number]>([0, 0, 0]);
  const shift = new Vector3();

  onBeforeRender(() => {
    const activeCamera = camera.value;
    if (!activeCamera || !computeOriginShift(activeCamera.position, ORIGIN_SHIFT_THRESHOLD, ORIGIN_SHIFT_STEP, shift))
      return;
    activeCamera.position.sub(shift);
    origin.add(shift);
    worldOffset.value = [-origin.x, 0, -origin.z];
  });

  return worldOffset;
};
