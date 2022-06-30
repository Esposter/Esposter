<script setup lang="ts">
import chatMembers from "@/assets/data/chatMembers.json";
import chatMessages from "@/assets/data/chatMessages.json";
import chatRooms from "@/assets/data/chatRooms.json";
import { useRoomStore } from "@/store/useRoomStore";

const route = useRoute();
const roomStore = useRoomStore();
roomStore.currentRoomId = typeof route.params.id === "string" ? route.params.id : null;
roomStore.roomList = chatRooms;
if (roomStore.currentRoomId) {
  roomStore.membersMap[roomStore.currentRoomId] = chatMembers;
  roomStore.messagesMap[roomStore.currentRoomId] = chatMessages;
}
</script>

<template>
  <div>
    <ChatWindow />
  </div>
</template>
