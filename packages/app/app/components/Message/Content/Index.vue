<script setup lang="ts">
import { useMessageStore } from "@/store/message";

const messageStore = useMessageStore();
const { copied, text } = storeToRefs(messageStore);
</script>

<template>
  <div bg-surface flex flex-col h-full relative>
    <MessageContentHeader />
    <v-divider />
    <MessageContentCallPanel />
    <MessageContentMessages />
    <StyledClipboardSnackbar v-model="copied" :source="text" />
  </div>
</template>
