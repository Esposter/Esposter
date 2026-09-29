import { ORIGIN_SHIFT_STEP, ORIGIN_SHIFT_THRESHOLD } from "#src/services/constants";
import { useLoop, useTres } from "@tresjs/core";
import { computeOriginShift } from "genshin-engine";
import { Vector3 } from "three";

// The floating origin: single-precision positions tremble far from the origin, so once the camera has gone a
// Kilometre out the world is moved back under it. The camera and its controls' target are pulled back by the shift,
// And the world's group, which every placed thing is inside, is offset by the new origin. The origin is the world
// Coordinate the scene's origin stands on, which the terrain adds to the camera to know where it is
export const useFloatingOrigin = () => {
  const { camera, controls } = useTres();
  const { onBeforeRender } = useLoop();
  const origin = new Vector3();
  const worldOffset = shallowRef<[number, number, number]>([0, 0, 0]);
  const shift = new Vector3();

  onBeforeRender(() => {
    const activeCamera = camera.value;
    if (!activeCamera || !computeOriginShift(activeCamera.position, ORIGIN_SHIFT_THRESHOLD, ORIGIN_SHIFT_STEP, shift))
      return;
    activeCamera.position.sub(shift);
    const target: unknown = controls.value && "target" in controls.value ? controls.value.target : undefined;
    if (target instanceof Vector3) target.sub(shift);
    origin.add(shift);
    worldOffset.value = [-origin.x, 0, -origin.z];
  });

  return { origin, worldOffset };
};
