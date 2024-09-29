<script setup lang="ts">
import { DEFAULT_VIEWPORT_TRANSFORM } from "@/services/flowchartEditor/constants";
import { ControlButton, Controls } from "@vue-flow/controls";
import { useVueFlow } from "@vue-flow/core";
import deepEqual from "fast-deep-equal";

const { setViewport, viewport } = useVueFlow();
const { surface, surfaceOpacity80, text } = useColors();
const disabled = computed(() => deepEqual(viewport.value, DEFAULT_VIEWPORT_TRANSFORM));
</script>

<template>
  <Controls position="top-right">
    <ControlButton title="Default Viewport" :disabled @click="setViewport(DEFAULT_VIEWPORT_TRANSFORM)">
      <v-icon :op="disabled ? 40 : undefined" icon="mdi-home" size="x-small" />
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
