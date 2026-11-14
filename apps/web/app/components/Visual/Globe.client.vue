<script setup lang="ts">
const canvas = useTemplateRef("canvas");
useGlobeScene(canvas);
</script>

<template>
  <canvas ref="canvas" size-full block />
</template>
