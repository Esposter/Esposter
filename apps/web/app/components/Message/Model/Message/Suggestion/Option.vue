<script setup lang="ts">
interface Props {
  isSelected: boolean;
}

defineSlots<{ default: () => VNode }>();
defineProps<Props>();
const emit = defineEmits<{ select: [] }>();
</script>

<!-- A row of a suggestion list. Its focus stays in the editor, so a press on it never takes the focus from the editor -->
<template>
  <!-- eslint-disable-next-line a11y/interactive-supports-focus -- focus stays in the editor, which walks the options -->
  <div :aria-selected="isSelected" role="option" ui-item @click="emit('select')" @mousedown.prevent>
    <slot />
  </div>
</template>
