import type { SunShadowOptions } from "#src/models/SunShadowOptions";

import { SHADOW_FRAME_PRIORITY } from "#src/services/constants";
import { checkEnemiesMoved } from "#src/services/shadow/checkEnemiesMoved";
import { writeEnemyPoses } from "#src/services/shadow/writeEnemyPoses";
import { useLoop, useTres } from "@tresjs/core";
import { checkSunTurned } from "genshin-engine";
import { Matrix4, Vector3 } from "three";

// The sun's cascades are drawn only when something they show has turned: the sun, the view they are split from, the
// Character's body or an enemy. Each frame that decides it, after the sky has turned the sun and the origin has
// Shifted, and a turn redraws every cascade, since each is split from the view and lit by the sun alike
export const useSunShadow = ({ characterBody, enemyMap, sunLight }: SunShadowOptions): void => {
  const { camera } = useTres();
  const { onBeforeRender } = useLoop();
  const { cascadedShadowNode, light } = sunLight;
  // What the cascades were last drawn for, from which the frame is compared; the first frame draws them all
  const drawnSunDirection = new Vector3();
  const sunDirection = new Vector3();
  const drawnViewMatrix = new Matrix4();
  const drawnBodyMatrix = new Matrix4();
  const drawnEnemyPoses: number[] = [];
  onBeforeRender(() => {
    const activeCamera = camera.value;
    if (!activeCamera) return;
    activeCamera.updateMatrix();
    sunDirection.subVectors(light.position, light.target.position).normalize();
    if (characterBody) characterBody.updateMatrix();
    const isBodyMoved = characterBody !== undefined && !characterBody.matrix.equals(drawnBodyMatrix);
    const isMoved =
      checkSunTurned(drawnSunDirection, sunDirection) ||
      !activeCamera.matrix.equals(drawnViewMatrix) ||
      isBodyMoved ||
      checkEnemiesMoved(enemyMap, drawnEnemyPoses);
    // Set on the frame the cascades are drawn and cleared on every other: three leaves a shadow's flag standing after it
    // draws whenever its depth map's version has moved meanwhile, so a flag left to the shadow would draw it every frame.
    // The template's flag is the one the cascades built later copy
    light.shadow.needsUpdate = isMoved;
    for (const { shadow } of cascadedShadowNode.lights) if (shadow) shadow.needsUpdate = isMoved;
    if (!isMoved) return;
    drawnSunDirection.copy(sunDirection);
    drawnViewMatrix.copy(activeCamera.matrix);
    if (characterBody) drawnBodyMatrix.copy(characterBody.matrix);
    writeEnemyPoses(enemyMap, drawnEnemyPoses);
  }, SHADOW_FRAME_PRIORITY);
};
