<script setup lang="ts">
import { useDataStore } from "@/store/message/data";

const { currentRoute } = useRouter();
const dataStore = useDataStore();
const { items } = storeToRefs(dataStore);
const roomId = currentRoute.value.params.id as string;
const rowKey = currentRoute.value.params.rowKey as string;

if (rowKey) {
  const scrollToMessage = useScrollToMessage();

  onMounted(async () => {
    await scrollToMessage(roomId, rowKey);
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
