<script setup lang="ts">
import type { MessageEntity } from "#shared/models/db/message/MessageEntity";

import { parse } from "node-html-parser";

interface ActionsSectionProps {
  message: MessageEntity;
}

const { message } = defineProps<ActionsSectionProps>();
const { copied, copy, text } = useClipboard();
const copyText = () => {
  const textContent = parse(message.message).textContent.trim();
  if (textContent) copy(textContent);
};
</script>

<template>
  <v-divider thickness="2" vertical h-6 self-center />
  <v-tooltip text="Copy Text">
    <template #activator="{ props }">
      <v-btn m-0 icon="mdi-content-copy" size="small" tile :="props" @click="copyText" />
    </template>
  </v-tooltip>
  <StyledClipboardSnackbar v-model="copied" :source="text" />
</template>
