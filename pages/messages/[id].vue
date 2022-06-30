<script setup lang="ts">
import chatMembers from "@/assets/data/chatMembers.json";
import chatMessages from "@/assets/data/chatMessages.json";
import { useRoomStore } from "@/store/useRoomStore";

const route = useRoute();
const roomStore = useRoomStore();
const { data, pending } = await useAsyncQuery(["room.getRooms"]);

roomStore.currentRoomId = typeof route.params.id === "string" ? route.params.id : null;

if (!pending.value) {
  console.log(data.value);
}

// roomStore.roomList = ;
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
