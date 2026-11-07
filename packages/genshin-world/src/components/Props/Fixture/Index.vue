<script setup lang="ts">
import type { WorldCameraPose } from "#src/models/world/WorldCameraPose";

import { createTresRenderer } from "#src/services/scene/createTresRenderer";
import { TresCanvas } from "@tresjs/core";
import { Euler, MathUtils } from "three";

interface Props {
  // The camera the box is drawn through, held still as a reference holds its own
  cameraPose: WorldCameraPose;
}

const { cameraPose } = defineProps<Props>();
const emit = defineEmits<{ ready: [] }>();
const cameraRotation = computed(
  () => new Euler(MathUtils.degToRad(cameraPose.pitch), MathUtils.degToRad(cameraPose.heading), 0, "YXZ"),
);
</script>

<template>
  <div class="props-fixture">
    <TresCanvas :renderer="createTresRenderer" @ready="emit('ready')">
      <TresPerspectiveCamera
        :far="2000"
        :fov="cameraPose.fov"
        :position="cameraPose.position"
        :rotation="cameraRotation"
      />
      <TresAmbientLight :intensity="0.6" />
      <TresDirectionalLight :intensity="1.4" :position="[4, 6, 5]" />
      <!-- A unit box stretched to the prop's proportions -->
      <TresMesh :scale="[1, 2, 1]">
        <TresBoxGeometry />
        <TresMeshStandardMaterial color="#c9a25a" />
      </TresMesh>
    </TresCanvas>
  </div>
</template>

<style scoped>
/* The game screen's own box, 1920 by 1080 units, so the canvas is drawn at the frame's size and not the page's */
.props-fixture {
  height: 1080px;
  width: 1920px;
}
</style>
