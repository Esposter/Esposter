<script setup lang="ts">
defineSlots<{ default: () => VNode }>();
</script>

<template>
  <v-main h-dvh>
    <v-container fluid relative h-full bg-surface>
      <slot />
    </v-container>
  </v-main>
</template>
