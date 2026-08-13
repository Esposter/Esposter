<script setup lang="ts">
interface StyledHelpTooltipProps {
  text: string;
}

const { text } = defineProps<StyledHelpTooltipProps>();
</script>

<template>
  <v-tooltip>
    <template #activator="{ props }">
      <v-icon :="props">mdi-help-circle</v-icon>
    </template>
    {{ text }}
  </v-tooltip>
</template>
