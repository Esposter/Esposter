<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";
import { storeToRefs } from "pinia";

const roomStore = useRoomStore();
const { roomList } = storeToRefs(roomStore);
</script>

<template>
  <v-list lines="two">
    <ChatRoomListItem v-for="room in roomList" :key="room.id" :room="room" />
  </v-list>
</template>
