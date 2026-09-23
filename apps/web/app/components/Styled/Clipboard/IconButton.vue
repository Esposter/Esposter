<script setup lang="ts">
import { useClipboardStore } from "@/store/clipboard";

interface Props {
  source: string;
  text?: string;
}

const { source, text } = defineProps<Props>();
const clipboardStore = useClipboardStore();
const { copy } = clipboardStore;
</script>

<template>
  <StyledTooltipIconButton
    :button-props="{ size: 'small' }"
    icon="i-mdi:clipboard"
    :text="text ?? 'Copy'"
    @click="copy(source)"
  />
</template>
