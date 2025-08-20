<script setup lang="ts">
import { useDataStore } from "@/store/message/data";

const dataStore = useDataStore();
const { messages } = storeToRefs(dataStore);
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
