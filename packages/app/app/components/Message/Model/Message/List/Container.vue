<script setup lang="ts">
import { useDataStore } from "@/store/message/data";

const dataStore = useDataStore();
const { items } = storeToRefs(dataStore);
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
  <MessageModelMessageListItemContainer
    v-for="(message, index) of items"
    :key="message.rowKey"
    :message
    :next-message="items[index + 1]"
  />
</template>
