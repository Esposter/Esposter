<script setup lang="ts">
import { useMessageStore } from "@/store/message";

const messageStore = useMessageStore();
const { copied, text } = storeToRefs(messageStore);
</script>

<template>
  <div relative h-full flex flex-col bg-surface>
    <MessageContentHeader />
    <v-divider />
    <MessageContentVoicePanel />
    <MessageContentMessages />
    <StyledClipboardSnackbar v-model="copied" :source="text" />
  </div>
</template>
