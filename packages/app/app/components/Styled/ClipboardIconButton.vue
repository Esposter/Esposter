<script setup lang="ts">
interface StyledClipboardIconButtonProps {
  source: string;
}

const { source } = defineProps<StyledClipboardIconButtonProps>();
const { copied, copy } = useClipboard({ source });
</script>

<template>
  <v-tooltip text="Copy">
    <template #activator="{ props: activatorProps }">
      <v-btn icon="mdi-clipboard" size="small" :="activatorProps" @click="copy(source)" />
    </template>
  </v-tooltip>
  <StyledClipboardSnackbar v-model="copied" :source />
</template>
