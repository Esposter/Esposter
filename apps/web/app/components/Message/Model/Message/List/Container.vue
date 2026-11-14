<script setup lang="ts">
import { useDataStore } from "@/store/message/data";
import { useRoomStore } from "@/store/message/room";
import { getRouteParam } from "@/util/router/getRouteParam";

const { currentRoute } = useRouter();
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const dataStore = useDataStore();
const { items } = storeToRefs(dataStore);
// Read once rather than as a computed: `messages/[id]/index` and `messages/[id]/[messageId]` are separate page
// Components with no `key` override, so Nuxt's default per-path key remounts this on either segment changing
// And the mounted scroll runs again for the message the new path names
const messageId = getRouteParam(currentRoute.value.params, "messageId");

if (messageId) {
  const scrollToMessage = useScrollToMessage();

  onMounted(async () => {
    await scrollToMessage(currentRoomId.value, messageId);
  });
}
</script>

<template>
  <MessageModelMessageListItemContainer
    v-for="(message, index) of items"
    :key="message.id"
    :message
    :next-message="items[index + 1]"
  />
</template>
