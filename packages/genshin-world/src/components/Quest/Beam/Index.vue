<script setup lang="ts">
import type { GroundPoint } from "genshin-engine";
import type { Vector3 } from "three";

import {
  QUEST_BEAM_BOTTOM,
  QUEST_BEAM_COLOR,
  QUEST_BEAM_MIN_DISTANCE,
  QUEST_BEAM_RADIUS,
  QUEST_BEAM_TOP,
} from "#src/services/quest/constants";
import { useLoop, useTres } from "@tresjs/core";
import { AdditiveBlending, CylinderGeometry, MeshBasicMaterial } from "three";

interface Props {
  // The world coordinate the scene's origin stands on, which the camera's distance from the objective is read through
  origin: Vector3;
  // Where the navigated objective stands
  position: GroundPoint;
}

const { origin, position } = defineProps<Props>();
const { camera } = useTres();
const { onBeforeRender } = useLoop();
const beamGeometry = new CylinderGeometry(
  QUEST_BEAM_RADIUS,
  QUEST_BEAM_RADIUS,
  QUEST_BEAM_TOP - QUEST_BEAM_BOTTOM,
  16,
  1,
  true,
).translate(0, (QUEST_BEAM_TOP + QUEST_BEAM_BOTTOM) / 2, 0);
const beamMaterial = new MeshBasicMaterial({
  blending: AdditiveBlending,
  color: QUEST_BEAM_COLOR,
  depthWrite: false,
  transparent: true,
});
const isVisible = ref(false);
// The game raises its beam only once the objective is far enough off to need finding
onBeforeRender(() => {
  const activeCamera = camera.value;
  if (!activeCamera) return;
  const distance = Math.hypot(
    activeCamera.position.x + origin.x - position.x,
    activeCamera.position.z + origin.z - position.z,
  );
  isVisible.value = distance >= QUEST_BEAM_MIN_DISTANCE;
});

onUnmounted(() => {
  beamGeometry.dispose();
  beamMaterial.dispose();
});
</script>

<template>
  <!-- The navigated objective's beam, a column of light over it, placed in the floating origin's world group -->
  <TresMesh
    :geometry="beamGeometry"
    :material="beamMaterial"
    :position="[position.x, 0, position.z]"
    :visible="isVisible"
  />
</template>
