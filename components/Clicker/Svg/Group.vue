<script setup lang="ts">
import { type SVGAttributes } from "vue";

export interface ClickerSvgGroupProps {
  gAttrs?: SVGAttributes;
}

defineSlots<{ default: (props: {}) => unknown }>();
const { gAttrs } = defineProps<ClickerSvgGroupProps>();
const emit = defineEmits<{ click: [value: MouseEvent] }>();
</script>

<template>
  <g :="gAttrs" @click="(e) => emit('click', e)">
    <slot />
  </g>
</template>
