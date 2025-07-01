<script setup lang="ts">
import { mergeProps } from "vue";

const dialog = ref(false);
</script>

<template>
  <v-dialog v-model="dialog" fullscreen>
    <template #activator="{ props: dialogProps }">
      <v-tooltip text="User Settings">
        <template #activator="{ props: tooltipProps }">
          <v-btn icon="mdi-cog" size="small" :="mergeProps(dialogProps, tooltipProps)" />
        </template>
      </v-tooltip>
    </template>
    <StyledCard>
      <v-btn absolute top-4 right-4 icon="mdi-close" size="small" @click="dialog = false" />
    </StyledCard>
  </v-dialog>
</template>
