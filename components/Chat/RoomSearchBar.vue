<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";
import { storeToRefs } from "pinia";

const client = useClient();
const roomStore = useRoomStore();
const { roomSearchBarFocused, roomSearchQuery, loadingRoomsSearched } = storeToRefs(roomStore);
const updateSearchQuery = async (value: string) => {
  roomSearchQuery.value = value;

  if (value) {
    loadingRoomsSearched.value = true;

    const { rooms, nextCursor } = await client.query("room.readRooms", { filter: { name: value }, cursor: null });
    roomStore.roomListSearched = rooms;
    roomStore.roomListSearchedNextCursor = nextCursor;

    loadingRoomsSearched.value = false;
  } else {
    roomStore.roomListSearched = [];
    roomStore.roomListSearchedNextCursor = null;
  }
};
</script>

<template>
  <v-text-field
    placeholder="Search"
    prepend-inner-icon="mdi-magnify"
    density="compact"
    hide-details
    :model-value="roomSearchQuery"
    @update:model-value="updateSearchQuery"
    @focusin="roomSearchBarFocused = true"
    @focusout="
      () => {
        roomSearchQuery = '';
        roomSearchBarFocused = false;
      }
    "
  />
</template>
