<script setup lang="ts">
import type { Group } from "three";

import { PaletteColor } from "@/models/agentConsole/PaletteColor";
import { AgentConsolePaletteMap } from "@/services/agentConsole/AgentConsolePaletteMap";
import {
  DOOR_HINGE_POSITION,
  DOOR_OPEN_ANGLE,
  DOOR_PANEL_POSITION,
  DOOR_PANEL_SCALE,
  DOOR_SWING_MOTION_UNITS,
} from "@/services/agentConsole/world/constants";
import { createTintableVoxelGeometry } from "@/services/agentConsole/world/createTintableVoxelGeometry";
import { toCssTimeMs } from "@/services/agentConsole/world/toCssTimeMs";
import { useAgentConsoleWorldStore } from "@/store/agentConsole/world";

const { onBeforeRender } = useLoop();
const agentConsoleWorldStore = useAgentConsoleWorldStore();
const { isDoorOpen } = storeToRefs(agentConsoleWorldStore);
// The UI's motion unit, a CSS time that reduced motion makes zero, so the door snaps when motion is not wanted
const motionUnit = useCssVar("--ui-motion-unit");
const swingMs = computed(() => toCssTimeMs(motionUnit.value ?? "") * DOOR_SWING_MOTION_UNITS);
const geometry = createTintableVoxelGeometry();
const hinge = useTresTemplateRef<Group>("hinge");
// The swing under way: the angle it left and the one it is going to, and when it started
let fromAngle = 0;
let toAngle = 0;
let swingStartMs = 0;

watch(isDoorOpen, (newIsDoorOpen) => {
  fromAngle = hinge.value?.rotation.y ?? toAngle;
  toAngle = newIsDoorOpen ? DOOR_OPEN_ANGLE : 0;
  swingStartMs = performance.now();
});
// Turned about its hinge on a decelerating curve, so it starts moving at once and settles into place
onBeforeRender(() => {
  if (!hinge.value) return;
  const progress = swingMs.value > 0 ? Math.min((performance.now() - swingStartMs) / swingMs.value, 1) : 1;
  hinge.value.rotation.y = fromAngle + (toAngle - fromAngle) * (1 - (1 - progress) ** 3);
});
</script>

<template>
  <!-- A panel on the wall's outer face, hung from its hinge, one white voxel scaled to it and tinted by the door's colour -->
  <TresGroup ref="hinge" :position="DOOR_HINGE_POSITION">
    <TresMesh :geometry :position="DOOR_PANEL_POSITION" :scale="DOOR_PANEL_SCALE">
      <TresMeshBasicMaterial :color="AgentConsolePaletteMap[PaletteColor.Door]" vertex-colors />
    </TresMesh>
  </TresGroup>
</template>
