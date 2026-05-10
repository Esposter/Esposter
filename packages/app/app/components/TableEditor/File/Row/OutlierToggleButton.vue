<script setup lang="ts">
import { useOutlierStore } from "@/store/tableEditor/file/outlier";

const outlierStore = useOutlierStore();
const { isOutlierHighlightEnabled } = storeToRefs(outlierStore);
</script>

<template>
  <v-tooltip :text="isOutlierHighlightEnabled ? 'Hide Outlier Highlighting' : 'Show Outlier Highlighting'">
    <template #activator="{ props: tooltipProps }">
      <v-btn
        size="small"
        tile
        m-0
        variant="text"
        :color="isOutlierHighlightEnabled ? 'warning' : undefined"
        :icon="isOutlierHighlightEnabled ? 'mdi-alert-circle' : 'mdi-alert-circle-outline'"
        :="tooltipProps"
        @click.stop="isOutlierHighlightEnabled = !isOutlierHighlightEnabled"
      />
    </template>
  </v-tooltip>
</template>
