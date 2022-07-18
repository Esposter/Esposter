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
  <NuxtLayout>
    <Head>
      <Title>{{ roomStore.name }}</Title>
    </Head>
    <template #left>
      <ChatLeftSideBar />
    </template>
    <template #right>
      <ChatRightSideBar />
    </template>
    <ChatContent />
    <template #footer>
      <ChatMessageInput />
    </template>
  </NuxtLayout>
</template>

<style lang="scss">
// Set max height here so we can hide global window scrollbar
// and show scrollbar within the chat content only for chat routes
.v-main {
  max-height: 100vh;
}
</style>
