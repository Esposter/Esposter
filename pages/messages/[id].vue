<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";

useHead({ titleTemplate: (title) => `Esbabbler | ${title}` });

const route = useRoute();
const roomStore = useRoomStore();
const client = useClient();
const [rooms, members, messages] = await Promise.all([
  client.query("room.readRooms"),
  client.query("room.getMembers"),
  client.query("room.getMessages"),
]);

roomStore.currentRoomId = typeof route.params.id === "string" ? route.params.id : null;
roomStore.roomList = rooms;
if (roomStore.currentRoomId) {
  roomStore.membersMap[roomStore.currentRoomId] = members;
  roomStore.messagesMap[roomStore.currentRoomId] = messages;
}

const roomExists = computed(() => roomStore.roomList.find((r) => r.id === roomStore.currentRoomId));
</script>

<template>
  <NuxtLayout mainClass="max-h-screen">
    <!-- Set max height here so we can hide global window scrollbar
    and show scrollbar within the chat content only for chat routes -->
    <Head>
      <Title>{{ roomStore.name }}</Title>
    </Head>
    <template #left>
      <ChatLeftSideBar />
    </template>
    <template #right v-if="roomExists">
      <ChatRightSideBar />
    </template>
    <ChatContent v-if="roomExists" />
    <template #footer v-if="roomExists">
      <ChatMessageInput />
    </template>
  </NuxtLayout>
</template>
