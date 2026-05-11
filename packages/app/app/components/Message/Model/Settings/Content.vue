<script setup lang="ts">
defineSlots<{ default: () => VNode }>();
</script>

<template>
  <v-main h-dvh>
    <v-container fluid bg-surface h-full relative>
      <slot />
    </v-container>
  </v-main>
</template>
