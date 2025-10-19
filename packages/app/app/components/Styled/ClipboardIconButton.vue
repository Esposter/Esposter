<script setup lang="ts">
interface StyledClipboardIconButtonProps {
  source: string;
  text?: string;
}

const { source, text } = defineProps<StyledClipboardIconButtonProps>();
const { copied, copy } = useClipboard({ source });
</script>

<template>
  <v-tooltip :text="text ?? 'Copy'">
    <template #activator="{ props }">
      <v-btn :="props" icon="mdi-clipboard" size="small" @click="copy(source)" />
    </template>
  </v-tooltip>
  <StyledClipboardSnackbar v-model="copied" :source />
</template>
