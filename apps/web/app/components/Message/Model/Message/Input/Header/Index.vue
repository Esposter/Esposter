<script setup lang="ts">
interface Props {
  isTopAttached?: boolean;
}

defineSlots<{ default: () => VNode }>();
const { isTopAttached } = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <div :class="isTopAttached ? '' : 'rd-t-2'" px-4 py-2 bg-background flex gap-2 items-center relative text-body-medium>
    <slot />
    <StyledTooltipIconButton
      top="1/2"
      b-1
      b-text
      b-solid
      right-4
      absolute
      translate-y="-1/2"
      icon="mdi-close"
      text="Close"
      :button-props="{ density: 'compact', size: 'small' }"
      @click="emit('close')"
    />
  </div>
</template>
