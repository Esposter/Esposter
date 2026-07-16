<script setup lang="ts">
import { useMessageStore } from "@/store/message";

const messageStore = useMessageStore();
const { copied, text } = storeToRefs(messageStore);
</script>

<template>
  <v-sheet flex flex-col h-full relative>
    <MessageContentHeader />
    <v-divider />
    <MessageContentCallPanel />
    <MessageContentMessages />
    <StyledClipboardSnackbar v-model="copied" :source="text" />
  </v-sheet>
</template>
