<script setup lang="ts">
interface HelpTooltipProps {
  text: string;
}

const { text } = defineProps<HelpTooltipProps>();
</script>

<template>
  <v-tooltip>
    <template #activator="{ props: activatorProps }">
      <v-icon :="activatorProps">mdi-help-circle</v-icon>
    </template>
    {{ text }}
  </v-tooltip>
</template>
