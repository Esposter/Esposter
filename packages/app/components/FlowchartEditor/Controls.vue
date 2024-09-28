<script setup lang="ts">
import { ControlButton, Controls } from "@vue-flow/controls";
import { useVueFlow } from "@vue-flow/core";

const { setViewport } = useVueFlow();
const { surface, surfaceOpacity80, text } = useColors();
</script>

<template>
  <Controls position="top-right">
    <ControlButton title="Reset Transform" @click="setViewport({ x: 0, y: 0, zoom: 1 })">
      <v-icon icon="mdi-cached" size="small" />
    </ControlButton>
  </Controls>
</template>

<style scoped lang="scss">
:deep(.vue-flow__controls-button) {
  background-color: v-bind(surface);
  fill: v-bind(text);
  border: 1px $border-style-root v-bind(text);

  &:hover {
    background-color: v-bind(surfaceOpacity80);
  }
}
</style>
