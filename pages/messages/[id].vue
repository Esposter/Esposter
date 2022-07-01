<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";

useHead({ titleTemplate: (title) => (title ? `Esbabbler | ${title}` : "Esbabbler") });

const route = useRoute();
const roomStore = useRoomStore();
const client = useClient();
const [rooms, members, messages] = await Promise.all([
  client.query("room.getRooms"),
  client.query("room.getMembers"),
  client.query("room.getMessages"),
]);

roomStore.currentRoomId = typeof route.params.id === "string" ? route.params.id : null;
roomStore.roomList = rooms;
if (roomStore.currentRoomId) {
  roomStore.membersMap[roomStore.currentRoomId] = members;
  roomStore.messagesMap[roomStore.currentRoomId] = messages;
}
</script>

<template>
  <div>
    <Head>
      <Title>{{ roomStore.name }}</Title>
    </Head>
    <ChatWindow />
  </div>
</template>
