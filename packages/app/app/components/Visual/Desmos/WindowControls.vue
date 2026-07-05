<script setup lang="ts">
const emit = defineEmits<{ clickLeft: [event: MouseEvent]; clickRight: [event: MouseEvent] }>();
</script>

<template>
  <div class="v-window__controls" bottom-0 top-auto fixed h="[calc(100dvh_-_--app-bar-height)]">
    <StyledTooltipIconButton
      :button-props="{ size: 'small' }"
      icon="mdi-chevron-left"
      text="Left"
      :tooltip-props="{ location: 'right center' }"
      @click="emit('clickLeft', $event)"
    />
    <StyledTooltipIconButton
      :button-props="{ size: 'small' }"
      icon="mdi-chevron-right"
      text="Right"
      :tooltip-props="{ location: 'left center' }"
      @click="emit('clickRight', $event)"
    />
  </div>
</template>
