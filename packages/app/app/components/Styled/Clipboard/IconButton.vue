<script setup lang="ts">
interface StyledClipboardIconButtonProps {
  source: string;
  text?: string;
}

const { source, text } = defineProps<StyledClipboardIconButtonProps>();
const { copied, copy } = useClipboard();
</script>

<template>
  <StyledTooltipIconButton
    :button-props="{ size: 'small' }"
    icon="mdi-clipboard"
    :text="text ?? 'Copy'"
    @click="copy(source)"
  />
  <StyledClipboardSnackbar v-model="copied" :source />
</template>
