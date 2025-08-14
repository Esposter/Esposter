<script setup lang="ts">
import { useScrollToMessage } from "@/composables/esbabbler/useScrollToMessage";
import { useMessageStore } from "@/store/esbabbler/message";

const messageStore = useMessageStore();
const { messages } = storeToRefs(messageStore);
const route = useRoute();
const rowKey = route.params.rowKey as string;

if (rowKey) {
  const scrollToMessage = useScrollToMessage();

  onMounted(() => {
    scrollToMessage(rowKey);
  });
}
</script>

<template>
  <EsbabblerModelMessageListItemContainer
    v-for="(message, index) of messages"
    :key="message.rowKey"
    :current-message="message"
    :next-message="messages[index + 1]"
  />
</template>
