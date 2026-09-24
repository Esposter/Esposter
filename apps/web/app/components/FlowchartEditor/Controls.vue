<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { DEFAULT_VIEWPORT_TRANSFORM } from "@/services/flowchartEditor/constants";
import { ControlButton, Controls } from "@vue-flow/controls";
import { useVueFlow } from "@vue-flow/core";
import deepEqual from "fast-deep-equal";

const { setViewport, viewport } = useVueFlow();
const disabled = computed(() => deepEqual(viewport.value, DEFAULT_VIEWPORT_TRANSFORM));
</script>

<template>
  <Controls position="bottom-left">
    <ControlButton title="Default Viewport" :disabled @click="setViewport(DEFAULT_VIEWPORT_TRANSFORM)">
      <UiIcon :class="disabled ? 'op-disabled' : undefined" :meaning="UiIconMeaning.ResetView" />
    </ControlButton>
  </Controls>
</template>

<style scoped>
/* Vue Flow's control is themed from outside, drawn as the style's frame */
:deep(.vue-flow__controls-button) {
  background-color: var(--ui-panel);
  border-radius: var(--ui-radius);
  box-shadow: var(--ui-frame-shadow);
  color: var(--ui-text);
  fill: var(--ui-text);
}

:deep(.vue-flow__controls-button:hover) {
  background-color: color-mix(in srgb, var(--ui-accent) 10%, var(--ui-panel));
}
</style>
