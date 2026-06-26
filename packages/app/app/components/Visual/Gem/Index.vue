<script setup lang="ts">
import { Vector3 } from "three/webgpu";

const cameraPosition = new Vector3(2, 2, 6);
const cameraLookAt = new Vector3(0, 0.75, 0);
</script>

<template>
  <div size-48>
    <TresCanvas :clear-alpha="0" shadows>
      <TresPerspectiveCamera :far="100" :fov="75" :look-at="cameraLookAt" :position="cameraPosition" />
      <OrbitControls
        :enable-pan="false"
        :enable-zoom="false"
        :target="[0, 0.75, 0]"
        :min-polar-angle="Math.PI / 2"
        :max-polar-angle="Math.PI / 2"
        enable-damping
      />
      <VisualGemScene />
    </TresCanvas>
  </div>
</template>
