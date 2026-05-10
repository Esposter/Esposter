<script setup lang="ts">
defineSlots<{ default: () => VNode }>();
</script>

<template>
  <v-main h-dvh>
    <v-container bg-surface fluid relative h-full>
      <slot />
    </v-container>
  </v-main>
</template>
