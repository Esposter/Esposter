<script setup lang="ts">
import { useWhiteboardStore } from "@/store/resource/whiteboard";

interface Props {
  fill: string;
  index: number;
}

// The fill of a shape or a sticky note, changed as the picker is moved
defineProps<Props>();
const whiteboardStore = useWhiteboardStore();
const { updateElementProperty } = whiteboardStore;
</script>

<template>
  <UiColorField
    :model-value="fill"
    label="Fill"
    @update:model-value="(value) => updateElementProperty(index, { property: 'fill', value })"
  />
</template>
