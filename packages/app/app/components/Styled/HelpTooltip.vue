<script setup lang="ts">
import { toRefs } from "vue";

interface HelpTooltipProps {
  text: string;
}

const props = defineProps<HelpTooltipProps>();
const { text } = toRefs(props);
</script>

<template>
  <v-tooltip>
    <template #activator="{ props: activatorProps }">
      <v-icon :="activatorProps">mdi-help-circle</v-icon>
    </template>
    {{ text }}
  </v-tooltip>
</template>
