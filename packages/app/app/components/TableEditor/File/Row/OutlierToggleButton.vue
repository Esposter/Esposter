<script setup lang="ts">
import { useFileTableEditorStore } from "@/store/tableEditor/file";

const fileTableEditorStore = useFileTableEditorStore();
const { isOutlierHighlightEnabled } = storeToRefs(fileTableEditorStore);
</script>

<template>
  <v-tooltip :text="isOutlierHighlightEnabled ? 'Hide Outlier Highlighting' : 'Show Outlier Highlighting'">
    <template #activator="{ props: tooltipProps }">
      <v-btn
        m-0
        size="small"
        tile
        variant="text"
        :color="isOutlierHighlightEnabled ? 'warning' : undefined"
        :icon="isOutlierHighlightEnabled ? 'mdi-alert-circle' : 'mdi-alert-circle-outline'"
        :="tooltipProps"
        @click.stop="isOutlierHighlightEnabled = !isOutlierHighlightEnabled"
      />
    </template>
  </v-tooltip>
</template>
