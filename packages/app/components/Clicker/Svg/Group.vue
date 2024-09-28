<script setup lang="ts">
import type { SVGAttributes } from "vue";

export interface ClickerSvgGroupProps {
  gAttrs?: SVGAttributes;
}

defineSlots<{ default: (props: Record<string, never>) => unknown }>();
const { gAttrs } = defineProps<ClickerSvgGroupProps>();
const emit = defineEmits<{ click: [event: MouseEvent] }>();
</script>

<template>
  <g :="gAttrs" @click="emit('click', $event)">
    <slot />
  </g>
</template>
