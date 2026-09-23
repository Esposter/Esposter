<script setup lang="ts">
import type { Group, Mesh } from "three";

import { PaletteColor } from "@/models/agentConsole/PaletteColor";
import { AgentConsolePaletteMap } from "@/services/agentConsole/AgentConsolePaletteMap";
import {
  FIGURE_BREATH_HEIGHT,
  FIGURE_BREATH_SPEED,
  MAX_FRAME_SECONDS,
  PLAYER_BODY_POSITION,
  PLAYER_BODY_SCALE,
  PLAYER_HEAD_POSITION,
  PLAYER_HEAD_SCALE,
  PLAYER_LEFT_ARM_POSITION,
  PLAYER_LEFT_LEG_POSITION,
  PLAYER_LIMB_SCALE,
  PLAYER_RIGHT_ARM_POSITION,
  PLAYER_RIGHT_LEG_POSITION,
  PLAYER_SPEED,
  PLAYER_STRIDE_LENGTH,
  PLAYER_SWING_ANGLE,
  PLAYER_SWING_SETTLE_RATE,
  SIMULATION_STEP_SECONDS,
} from "@/services/agentConsole/world/constants";
import { createRoomGrid } from "@/services/agentConsole/world/createRoomGrid";
import { createTintableVoxelGeometry } from "@/services/agentConsole/world/createTintableVoxelGeometry";
import { moveThroughGrid } from "@/services/agentConsole/world/moveThroughGrid";
import { useAgentConsolePlayerStore } from "@/store/agentConsole/player";
import { Vector2 } from "three";

interface Props {
  readMove: (out: Vector2) => void;
}

const { readMove } = defineProps<Props>();
const { onBeforeRender } = useLoop();
const agentConsolePlayerStore = useAgentConsolePlayerStore();
const { playerState } = agentConsolePlayerStore;
const reducedMotion = usePreferredReducedMotion();
const roomGrid = createRoomGrid();
// The head and body stand on their base; a limb hangs from its top, the joint it swings about
const standingGeometry = createTintableVoxelGeometry().translate(-0.5, 0, -0.5);
const hangingGeometry = createTintableVoxelGeometry().translate(-0.5, -1, -0.5);
const figure = useTresTemplateRef<Group>("figure");
const leftArm = useTresTemplateRef<Mesh>("leftArm");
const rightArm = useTresTemplateRef<Mesh>("rightArm");
const leftLeg = useTresTemplateRef<Mesh>("leftLeg");
const rightLeg = useTresTemplateRef<Mesh>("rightLeg");
const move = new Vector2();
let accumulatedSeconds = 0;
let swing = 0;
// Movement advances in fixed steps spent from the time the frames took, and the figure is drawn between its last two
// Positions, so the walk is the same on a slow screen and a fast one. Nothing here allocates
onBeforeRender(({ delta, elapsed }) => {
  readMove(move);
  const isWalking = move.lengthSq() > 0;
  // Forward is away from the camera, and right is its right, so the keys move the player as the camera sees it
  const sine = Math.sin(playerState.cameraAzimuth);
  const cosine = Math.cos(playerState.cameraAzimuth);
  const stepLength = PLAYER_SPEED * SIMULATION_STEP_SECONDS;
  const stepX = (move.x * cosine - move.y * sine) * stepLength;
  const stepZ = (-move.x * sine - move.y * cosine) * stepLength;
  accumulatedSeconds += Math.min(delta, MAX_FRAME_SECONDS);

  while (accumulatedSeconds >= SIMULATION_STEP_SECONDS) {
    playerState.previousPosition.copy(playerState.position);
    moveThroughGrid(roomGrid, playerState.position, stepX, stepZ);
    playerState.walkedDistance += playerState.position.distanceTo(playerState.previousPosition);
    accumulatedSeconds -= SIMULATION_STEP_SECONDS;
  }

  if (isWalking) playerState.heading = Math.atan2(stepX, stepZ);
  playerState.renderPosition.lerpVectors(
    playerState.previousPosition,
    playerState.position,
    accumulatedSeconds / SIMULATION_STEP_SECONDS,
  );
  if (!figure.value) return;
  figure.value.position.copy(playerState.renderPosition);
  figure.value.rotation.y = playerState.heading;
  // Asked for reduced motion, the limbs hang still and the figure does not breathe
  if (reducedMotion.value === "reduce") return;
  // Timed by the distance walked, so the feet never slide, and settling back to hanging once the player stops
  const swingTarget = isWalking
    ? Math.sin((playerState.walkedDistance / PLAYER_STRIDE_LENGTH) * 2 * Math.PI) * PLAYER_SWING_ANGLE
    : 0;
  swing += (swingTarget - swing) * (1 - Math.exp(-PLAYER_SWING_SETTLE_RATE * delta));
  if (leftArm.value) leftArm.value.rotation.x = swing;
  if (rightLeg.value) rightLeg.value.rotation.x = swing;
  if (rightArm.value) rightArm.value.rotation.x = -swing;
  if (leftLeg.value) leftLeg.value.rotation.x = -swing;
  if (!isWalking) figure.value.position.y += Math.sin(elapsed * FIGURE_BREATH_SPEED) * FIGURE_BREATH_HEIGHT;
});
</script>

<template>
  <!-- Six boxes, each one white voxel scaled to its part and tinted by its colour -->
  <TresGroup ref="figure" :position="playerState.renderPosition">
    <TresMesh :geometry="standingGeometry" :position="PLAYER_HEAD_POSITION" :scale="PLAYER_HEAD_SCALE">
      <TresMeshBasicMaterial :color="AgentConsolePaletteMap[PaletteColor.Skin]" vertex-colors />
    </TresMesh>
    <TresMesh :geometry="standingGeometry" :position="PLAYER_BODY_POSITION" :scale="PLAYER_BODY_SCALE">
      <TresMeshBasicMaterial :color="AgentConsolePaletteMap[PaletteColor.Accent]" vertex-colors />
    </TresMesh>
    <TresMesh ref="leftArm" :geometry="hangingGeometry" :position="PLAYER_LEFT_ARM_POSITION" :scale="PLAYER_LIMB_SCALE">
      <TresMeshBasicMaterial :color="AgentConsolePaletteMap[PaletteColor.Accent]" vertex-colors />
    </TresMesh>
    <TresMesh
      ref="rightArm"
      :geometry="hangingGeometry"
      :position="PLAYER_RIGHT_ARM_POSITION"
      :scale="PLAYER_LIMB_SCALE"
    >
      <TresMeshBasicMaterial :color="AgentConsolePaletteMap[PaletteColor.Accent]" vertex-colors />
    </TresMesh>
    <TresMesh ref="leftLeg" :geometry="hangingGeometry" :position="PLAYER_LEFT_LEG_POSITION" :scale="PLAYER_LIMB_SCALE">
      <TresMeshBasicMaterial :color="AgentConsolePaletteMap[PaletteColor.Stone]" vertex-colors />
    </TresMesh>
    <TresMesh
      ref="rightLeg"
      :geometry="hangingGeometry"
      :position="PLAYER_RIGHT_LEG_POSITION"
      :scale="PLAYER_LIMB_SCALE"
    >
      <TresMeshBasicMaterial :color="AgentConsolePaletteMap[PaletteColor.Stone]" vertex-colors />
    </TresMesh>
  </TresGroup>
</template>
