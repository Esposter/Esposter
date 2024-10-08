<script setup lang="ts">
export interface ClickerSvgGroupProps {
  gAttrs?: Record<string, unknown>;
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
