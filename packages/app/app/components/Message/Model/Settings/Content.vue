<script setup lang="ts">
defineSlots<{ default: () => VNode }>();
</script>

<template>
  <v-main h-dvh>
    <v-container class="bg-surface" relative h-full fluid>
      <slot />
    </v-container>
  </v-main>
</template>
