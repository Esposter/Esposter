<script setup lang="ts">
import { getTypingMessage } from "@/services/esbabbler/getTypingMessage";
import { useMessageStore } from "@/store/esbabbler/message";

const messageStore = useMessageStore();
const { typingList } = storeToRefs(messageStore);
const typingMessage = computed(() => getTypingMessage(typingList.value.map(({ username }) => username)));
</script>

<template>
  <div relative flex h-full flex-col>
    <EsbabblerContentHeader />
    <EsbabblerContentMessages />
  </div>
</template>
