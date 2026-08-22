<script setup lang="ts">
defineSlots<{ default: () => VNode }>();
// Permanent on desktop; on mobile it becomes a temporary overlay toggled from the content header
const { smAndDown } = useVDisplay();
const isOpen = defineModel<boolean>("open", { default: false });
</script>

<template>
  <StyledNavigationDrawer v-model="isOpen" location="left" :permanent="!smAndDown" :temporary="smAndDown">
    <slot />
  </StyledNavigationDrawer>
</template>

<style scoped>
/* Positioning context for the StyledSlideIndicator rail every settings sidebar hangs off. It is the whole list
   rather than a group's items, which is what lets one bar slide between groups instead of a new one appearing
   inside each. It also puts the bar outside the clip a group applies while it expands. */
:deep(.v-list) {
  position: relative;
}
</style>
