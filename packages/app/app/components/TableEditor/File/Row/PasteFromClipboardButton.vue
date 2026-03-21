<script setup lang="ts">
const pasteFromClipboard = usePasteFromClipboard();
</script>

<template>
  <v-tooltip text="Paste from Clipboard">
    <template #activator="{ props: tooltipProps }">
      <v-btn m-0 icon="mdi-content-paste" size="small" tile :="tooltipProps" @click.stop="pasteFromClipboard()" />
    </template>
  </v-tooltip>
</template>
