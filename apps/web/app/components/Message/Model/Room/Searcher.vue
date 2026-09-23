<script setup lang="ts">
import { useRoomSearchStore } from "@/store/message/room/search";
import { useCommandStore } from "@/store/ui/command";
import { RoutePath } from "@esposter/shared";

const roomSearchStore = useRoomSearchStore();
const { hasMore, items, searchQuery } = storeToRefs(roomSearchStore);
const { readMoreSearchedItems } = roomSearchStore;
const commandStore = useCommandStore();
const { openCommandPalette } = commandStore;

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
  <v-btn text="Find or start a conversation" variant="outlined" @click="openCommandPalette()" />
</template>
