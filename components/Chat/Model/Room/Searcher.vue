<script setup lang="ts">
import { useRoomStore } from "@/store/chat/room";

const roomStore = useRoomStore();
const { roomSearchQuery } = storeToRefs(roomStore);
const dialog = ref(false);
</script>

<template>
  <v-btn case="normal!" variant="outlined" @click="dialog = true">Find or start a conversation</v-btn>
  <v-dialog v-model="dialog" max-width="500">
    <v-card>
      <v-card-title>
        <v-text-field
          v-model="roomSearchQuery"
          placeholder="Where would you like to go?"
          prepend-inner-icon="mdi-magnify"
          density="compact"
          hide-details
        />
      </v-card-title>
      <v-card-text overflow-y="auto">
        <ChatModelRoomListSearched @update:room="dialog = false" />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
