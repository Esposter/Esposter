<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useRoomStore } from "@/store/useRoomStore";

const { $client } = useNuxtApp();
const roomStore = useRoomStore();
const { initialiseRoomListSearched, updateRoomListSearchedNextCursor } = roomStore;
const { roomSearchQuery } = storeToRefs(roomStore);
const updateSearchQuery = async (value: string) => {
  roomSearchQuery.value = value;

  if (value) {
    const { data } = await $client.room.readRooms.query({ filter: { name: value }, cursor: null });
    if (data.value) {
      initialiseRoomListSearched(data.value.rooms);
      updateRoomListSearchedNextCursor(data.value.nextCursor);
    }
  } else {
    initialiseRoomListSearched([]);
    updateRoomListSearchedNextCursor(null);
  }
};
const dialog = ref(false);
</script>

<template>
  <v-btn case="normal!" variant="outlined" @click="dialog = true">Find or start a conversation</v-btn>
  <v-dialog v-model="dialog" max-width="400">
    <v-card>
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
