import type { WorldCameraOptions } from "#src/models/world/WorldCameraOptions";

import { Euler, MathUtils } from "three";
import { computed, watch } from "vue";

// The camera the world is drawn through: the one the enemies' name tags project through, where it stands in world metres,
// Which the world's host reads to know where a player is, the rotation a reference holds it still at, and the frame owed
// To a canvas the pause was lifted from
export const useWorldCamera = ({ canvas, getCameraPose, getIsPaused, origin }: WorldCameraOptions) => {
  const getCamera = () => canvas.value?.context?.camera.activeCamera.value;
  const readCameraPosition = () => {
    const activeCamera = getCamera();
    return activeCamera ? activeCamera.position.clone().add(origin) : origin.clone();
  };
  const cameraRotation = computed(() => {
    const cameraPose = getCameraPose();
    return cameraPose
      ? new Euler(MathUtils.degToRad(cameraPose.pitch), MathUtils.degToRad(cameraPose.heading), 0, "YXZ")
      : undefined;
  });
  // @TODO: https://github.com/Tresjs/tres/issues/1487 — TresJS draws only while it owes a frame, and always mode owes one
  // Only once it has drawn, so a canvas switched from manual, having drawn the frame it was owed, never draws again. The
  // Uncovered world is owed one while the canvas is still manual, before its props change
  watch(
    getIsPaused,
    (newIsPaused) => {
      if (!newIsPaused) canvas.value?.context?.renderer.advance();
    },
    { flush: "sync" },
  );
  return { cameraRotation, getCamera, readCameraPosition };
};
