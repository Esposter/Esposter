<script setup lang="ts">
import { useClipboardStore } from "@/store/clipboard";

interface StyledClipboardIconButtonProps {
  source: string;
  text?: string;
}

const { source, text } = defineProps<StyledClipboardIconButtonProps>();
const clipboardStore = useClipboardStore();
const { copy } = clipboardStore;
</script>

<template>
  <StyledTooltipIconButton
    :button-props="{ size: 'small' }"
    icon="mdi-clipboard"
    :text="text ?? 'Copy'"
    @click="copy(source)"
  />
</template>
