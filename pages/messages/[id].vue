<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";

const route = useRoute();
const roomStore = useRoomStore();
const { data: roomsData, pending: roomsPending } = await useAsyncQuery(["room.getRooms"]);
const { data: membersData, pending: membersPending } = await useAsyncQuery(["room.getMembers"]);
const { data: messagesData, pending: messagesPending } = await useAsyncQuery(["room.getMessages"]);

roomStore.currentRoomId = typeof route.params.id === "string" ? route.params.id : null;

if (!roomsPending.value) roomStore.roomList = roomsData.value;

if (roomStore.currentRoomId) {
  if (!membersPending.value) roomStore.membersMap[roomStore.currentRoomId] = membersData.value;
  if (!messagesPending.value) roomStore.messagesMap[roomStore.currentRoomId] = messagesData.value;
}
</script>

<template>
  <div>
    <ChatWindow />
  </div>
</template>
