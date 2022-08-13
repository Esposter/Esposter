<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";
import { storeToRefs } from "pinia";

const client = useClient();
const roomStore = useRoomStore();
const { roomSearchQuery } = storeToRefs(roomStore);
const updateSearchQuery = async (value: string) => {
  roomSearchQuery.value = value;

  if (value) {
    const { rooms, nextCursor } = await client.query("room.readRooms", { filter: { name: value }, cursor: null });
    roomStore.roomListSearched = rooms;
    roomStore.roomListSearchedNextCursor = nextCursor;
  } else {
    roomStore.roomListSearched = [];
    roomStore.roomListSearchedNextCursor = null;
  }
};
const dialog = ref(false);
</script>

<template>
  <v-dialog v-model="dialog" transition="none">
    <template #activator="{ props }">
      <v-btn class="normal-case" variant="outlined" :="props">Find or start a conversation</v-btn>
    </template>
    <v-card min-width="400">
      <v-card-title>
        <v-text-field
          placeholder="Where would you like to go?"
          prepend-inner-icon="mdi-magnify"
          density="compact"
          hide-details
          :model-value="roomSearchQuery"
          @update:model-value="updateSearchQuery"
        />
      </v-card-title>
      <v-card-text overflow-y="auto">
        <ChatRoomsSearched @update:room="dialog = false" />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
