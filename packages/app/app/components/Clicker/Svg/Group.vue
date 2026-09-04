<script setup lang="ts">
import type { GroupProps } from "@/components/Clicker/Svg/GroupProps";

defineSlots<{ default: () => VNode }>();
const { gAttrs } = defineProps<GroupProps>();
const emit = defineEmits<{ click: [event: MouseEvent] }>();
</script>

<template>
  <g :="gAttrs" @click="emit('click', $event)">
    <slot />
  </g>
</template>
