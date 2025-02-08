<script setup lang="ts">
import { OrbitControls } from "@tresjs/cientos";

const width = 200;
const height = 200;
</script>

<template>
  <TransitionFade>
    <div :style="{ width: `${width}px`, height: `${height}px` }">
      <TresCanvas alpha shadows>
        <TresPerspectiveCamera
          :position="{ x: 2, y: 2, z: 6 }"
          :fov="75"
          :aspect="width / height"
          :near="0.1"
          :far="100"
        />
        <TresAmbientLight :color="0xfff" :intensity="4" />
        <TresDirectionalLight :position="{ x: 1, y: 1, z: 1 }" :color="0xfff" :intensity="6" />
        <TresDirectionalLight :position="{ x: -1, y: -1, z: -1 }" :color="0xfff" :intensity="6" />
        <OrbitControls
          :enable-pan="false"
          :enable-zoom="false"
          :min-polar-angle="Math.PI / 2"
          :max-polar-angle="Math.PI / 2"
          :target="[0, 0.75, 0]"
        />
        <Suspense>
          <VisualGemModel />
        </Suspense>
      </TresCanvas>
    </div>
  </TransitionFade>
</template>
