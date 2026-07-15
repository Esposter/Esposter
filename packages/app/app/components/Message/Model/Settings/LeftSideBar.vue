<script setup lang="ts">
defineSlots<{ default: () => VNode }>();
// Permanent on desktop; on mobile it becomes a temporary overlay toggled from the content header
const { smAndDown } = useVDisplay();
const isOpen = defineModel<boolean>("open", { default: false });
</script>

<template>
  <v-navigation-drawer v-model="isOpen" location="left" :permanent="!smAndDown" :temporary="smAndDown">
    <slot />
  </v-navigation-drawer>
</template>
