<script setup lang="ts">
const emit = defineEmits<{ clickLeft: [event: MouseEvent]; clickRight: [event: MouseEvent] }>();
</script>

<template>
  <div
    class="v-window__controls"
    bottom="[--dock-inset-block-end]"
    top-auto
    fixed
    h="[calc(100dvh_-_--dock-inset-block-end)]"
  >
    <StyledTooltipIconButton
      :button-props="{ size: 'small' }"
      icon="i-mdi:chevron-left"
      text="Left"
      :tooltip-props="{ location: 'right center' }"
      @click="emit('clickLeft', $event)"
    />
    <StyledTooltipIconButton
      :button-props="{ size: 'small' }"
      icon="i-mdi:chevron-right"
      text="Right"
      :tooltip-props="{ location: 'left center' }"
      @click="emit('clickRight', $event)"
    />
  </div>
</template>
