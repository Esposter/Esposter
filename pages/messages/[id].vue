<script setup lang="ts">
import type { MessageEntity } from "@/services/azure/types";
import { useRoomStore } from "@/store/useRoomStore";
import { storeToRefs } from "pinia";

// useHead({ titleTemplate: (title) => `Esbabbler | ${title}` });

const route = useRoute();
const client = useClient();
const roomStore = useRoomStore();
const { currentRoomId, roomList, name } = storeToRefs(roomStore);
roomStore.currentRoomId = typeof route.params.id === "string" ? route.params.id : null;

const [{ rooms, nextCursor }, members, messages] = await Promise.all([
  client.query("room.readRooms"),
  client.query("room.readMembers"),
  roomStore.currentRoomId
    ? client.query("message.readMessages", { partitionKey: roomStore.currentRoomId })
    : ([] as MessageEntity[]),
]);

roomStore.roomList = rooms;
roomStore.roomListNextCursor = nextCursor;
if (roomStore.currentRoomId) {
  roomStore.membersMap[roomStore.currentRoomId] = members;
  roomStore.messagesMap[roomStore.currentRoomId] = messages;
}

const roomExists = computed(() => roomList.value.find((r) => r.id === currentRoomId.value));
</script>

<template>
  <NuxtLayout mainClass="max-h-screen">
    <!-- Set max height here so we can hide global window scrollbar
    and show scrollbar within the chat content only for chat routes -->
    <Head>
      <Title>{{ name }}</Title>
    </Head>
    <template #left>
      <ChatLeftSideBar />
    </template>
    <template #right v-if="roomExists">
      <ChatRightSideBar />
    </template>
    <template #default="props" v-if="roomExists">
      <ChatContent :="props" />
    </template>
    <template #footer v-if="roomExists">
      <ChatMessageInput />
    </template>
  </NuxtLayout>
</template>
