<script setup lang="ts">
import { useRoomSearchStore } from "@/store/message/room/search";
import { RoutePath } from "@esposter/shared";

const roomSearchStore = useRoomSearchStore();
const { hasMore, items, searchQuery } = storeToRefs(roomSearchStore);
const { readMoreSearchedItems } = roomSearchStore;

useCommandScope({
  commands: () =>
    items.value.map(({ id, image, name }) => ({
      group: "Rooms",
      id,
      image: image ?? "",
      title: name ?? "",
      to: RoutePath.Messages(id),
    })),
  hasMore: () => hasMore.value,
  placeholder: "Where would you like to go?",
  query: searchQuery,
  readMore: readMoreSearchedItems,
  title: "Rooms",
});
</script>

<template>
  <AppSearchButton label="Find or start a conversation" w-full />
</template>
