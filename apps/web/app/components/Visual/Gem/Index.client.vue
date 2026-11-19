<script setup lang="ts">
import { Vector3 } from "three/webgpu";

// The point the camera looks at and the orbit turns about, held once so the two cannot drift apart
const center: [number, number, number] = [0, 0.75, 0];
</script>

<template>
  <div>
    <TresCanvas :clear-alpha="0" shadows>
      <TresPerspectiveCamera :far="100" :fov="75" :look-at="new Vector3(...center)" :position="new Vector3(2, 2, 6)" />
      <OrbitControls
        :enable-pan="false"
        :enable-zoom="false"
        :target="center"
        :min-polar-angle="Math.PI / 2"
        :max-polar-angle="Math.PI / 2"
        enable-damping
      />
      <VisualGemScene />
    </TresCanvas>
  </div>
</template>
