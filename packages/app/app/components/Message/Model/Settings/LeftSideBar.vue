<script setup lang="ts">
defineSlots<{ default: () => VNode }>();
</script>

<template>
  <v-navigation-drawer location="left" rail permanent>
    <slot />
  </v-navigation-drawer>
</template>
