<script setup lang="ts">
const canvas = useTemplateRef("canvas");
useGlobeScene(canvas);
</script>

<template>
  <canvas ref="canvas" max-w-180 w-full block aspect-square />
</template>
