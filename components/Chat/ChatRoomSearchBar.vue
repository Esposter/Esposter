<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";

const roomStore = useRoomStore();
const client = useClient();
const updateSearchQuery = useDebounce(async (val: string) => {
  if (val !== roomStore.roomSearchQuery) {
    roomStore.roomSearchQuery = val;
    roomStore.roomList = await client.query("room.getRooms", { filter: { name: val } });
  }
}, 500);
</script>

<template>
  <v-text-field
    placeholder="Search"
    prepend-inner-icon="mdi-magnify"
    density="compact"
    hide-details
    @update:model-value="updateSearchQuery"
  />
</template>
