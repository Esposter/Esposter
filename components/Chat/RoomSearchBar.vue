<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";

const client = useClient();
const roomStore = useRoomStore();
const updateSearchQuery = useDebounce(async (value: string) => {
  if (value !== roomStore.roomSearchQuery) {
    const { rooms, nextCursor } = await client.query("room.readRooms", { filter: { name: value }, cursor: null });
    roomStore.roomSearchQuery = value;
    roomStore.roomList = rooms;
    roomStore.roomNextCursor = nextCursor;
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
