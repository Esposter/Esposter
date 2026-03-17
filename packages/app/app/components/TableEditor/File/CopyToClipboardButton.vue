<script setup lang="ts">
interface CopyToClipboardButtonProps {
  rowIds?: string[];
}

const { rowIds } = defineProps<CopyToClipboardButtonProps>();
const copyToClipboard = useCopyToClipboard();
</script>

<template>
  <v-tooltip text="Copy to Clipboard">
    <template #activator="{ props: tooltipProps }">
      <v-btn m-0 icon="mdi-content-copy" size="small" tile :="tooltipProps" @click.stop="copyToClipboard(rowIds)" />
    </template>
  </v-tooltip>
</template>
