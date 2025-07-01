<script setup lang="ts">
import { mergeProps } from "vue";

const isOpen = ref(false);
</script>

<template>
  <v-dialog v-model="isOpen" fullscreen>
    <template #activator="{ props: dialogProps }">
      <v-tooltip text="User Settings">
        <template #activator="{ props: tooltipProps }">
          <v-btn icon="mdi-cog" size="small" :="mergeProps(dialogProps, tooltipProps)" />
        </template>
      </v-tooltip>
    </template>
    <StyledCard />
  </v-dialog>
</template>
