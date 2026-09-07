<script setup lang="ts">
import { useRoomStore } from "@/store/message/room";

const { smAndDown } = useVDisplay();
const roomStore = useRoomStore();
const { currentRoom } = storeToRefs(roomStore);
</script>

<template>
  <!-- Bottom action bar keeps room actions within thumb reach on small screens -->
  <div v-if="smAndDown" px-2 pt-1 flex gap-1 items-center>
    <MessageContentShowRoomListButton />
    <MessageContentHeaderActionButtons v-if="currentRoom" />
    <MessageContentShowSearchButton />
  </div>
</template>
