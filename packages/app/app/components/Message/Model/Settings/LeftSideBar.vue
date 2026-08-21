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
/* Positioning context for the StyledSlideIndicator rail every settings sidebar hangs off its list groups. */
:deep(.v-list-group__items) {
  position: relative;
}
</style>
