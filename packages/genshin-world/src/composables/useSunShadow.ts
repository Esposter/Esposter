import type { SunShadowOptions } from "#src/models/SunShadowOptions";

import { BODY_SHADOW_CASCADES, SHADOW_FRAME_PRIORITY } from "#src/services/constants";
import { checkEnemiesMoved } from "#src/services/shadow/checkEnemiesMoved";
import { writeEnemyPoses } from "#src/services/shadow/writeEnemyPoses";
import { useLoop } from "@tresjs/core";
import { checkSunTurned, FOLLOW_CAMERA_PIVOT_HEIGHT } from "genshin-engine";
import { Matrix4, Vector3 } from "three";

// The sun's cascades are drawn only when something they show has turned: the sun, the character's body or an enemy. They
// Are centred on the camera's pivot above the body, not the view, so an orbit draws nothing, and a walk draws the nearest
// Two once the body has moved, and each once its anchor has moved a step of its map. Each frame that decides it, after the
// Sky has turned the sun and the origin has shifted
export const useSunShadow = ({ enemyMap, getCharacterBody, sunLight }: SunShadowOptions): void => {
  const { onBeforeRender } = useLoop();
  const { cascadedShadowNode, light } = sunLight;
  // What the cascades were last drawn for, from which the frame is compared; the first frame draws them all
  const drawnSunDirection = new Vector3();
  const sunDirection = new Vector3();
  const drawnBodyMatrix = new Matrix4();
  const drawnEnemyPoses: number[] = [];
  onBeforeRender(() => {
    sunDirection.subVectors(light.position, light.target.position).normalize();
    const characterBody = getCharacterBody();
    if (characterBody) {
      characterBody.updateMatrix();
      characterBody.getWorldPosition(cascadedShadowNode.anchor);
      cascadedShadowNode.anchor.y += FOLLOW_CAMERA_PIVOT_HEIGHT;
    }
    const isBodyMoved = characterBody !== undefined && !characterBody.matrix.equals(drawnBodyMatrix);
    const isSunOrEnemyMoved =
      checkSunTurned(drawnSunDirection, sunDirection) || checkEnemiesMoved(enemyMap, drawnEnemyPoses);
    const isMoved = isSunOrEnemyMoved || isBodyMoved;
    // Set on the frame the cascades are drawn and cleared on every other: three leaves a shadow's flag standing after it
    // Draws whenever its depth map's version has moved meanwhile, so a flag left to the shadow would draw it every frame.
    // The cascades' node sets their flag again when its anchor has moved a texel, after this and before the frame draws.
    // The body casts only into the nearest cascades, the others' slices lying past the reach of its shadow
    light.shadow.needsUpdate = isMoved;
    for (const [index, { shadow }] of cascadedShadowNode.lights.entries())
      if (shadow) shadow.needsUpdate = isSunOrEnemyMoved || (isBodyMoved && index < BODY_SHADOW_CASCADES);
    if (!isMoved) return;
    drawnSunDirection.copy(sunDirection);
    if (characterBody) drawnBodyMatrix.copy(characterBody.matrix);
    writeEnemyPoses(enemyMap, drawnEnemyPoses);
  }, SHADOW_FRAME_PRIORITY);
};
