<script setup lang="ts">
import { useMessageStore } from "@/store/message";

const messageStore = useMessageStore();
const { copied, text } = storeToRefs(messageStore);
</script>

<template>
  <div class="bg-surface" relative flex h-full flex-col>
    <MessageContentHeader />
    <v-divider />
    <MessageContentMessages />
    <StyledClipboardSnackbar v-model="copied" :source="text" />
  </div>
</template>
