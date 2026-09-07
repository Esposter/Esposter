<script setup lang="ts">
import { useDataStore } from "@/store/message/data";
import { getRouteParamString } from "@/util/router/getRouteParamString";
import { requireRouteParam } from "@/util/router/requireRouteParam";

const { currentRoute } = useRouter();
const dataStore = useDataStore();
const { items } = storeToRefs(dataStore);
// Read once rather than as computeds: `messages/[id]/index` and `messages/[id]/[rowKey]` are separate page
// Components with no `key` override, so Nuxt's default per-path key remounts this on either segment changing
// And the mounted scroll runs again for the message the new path names
const roomId = requireRouteParam(currentRoute.value.params, "id");
const rowKey = getRouteParamString(currentRoute.value.params.rowKey);

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
