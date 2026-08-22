<script setup lang="ts">
import { useVisualStore } from "@/store/dashboard/visual";

const visualStore = useVisualStore();
const { createVisual } = visualStore;
</script>

<template>
  <v-toolbar px-4 py-2 b-0 b-b-1 b-border b-solid flex flex-wrap gap-2 items-center>
    <v-spacer />
    <!-- v-toolbar provides variant="text" and the global VBtn default is flat, so this deliberately
      raised button has to restate both -->
    <StyledTooltipIconButton
      icon="mdi-plus"
      :button-props="{ flat: false, variant: 'elevated' }"
      :is-icon-button="false"
      text="Add Visual"
      @click="createVisual"
    />
  </v-toolbar>
</template>
