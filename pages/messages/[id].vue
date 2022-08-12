<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";
import { storeToRefs } from "pinia";

useHead({ titleTemplate: (title) => `Esbabbler | ${title}` });

const route = useRoute();
const client = useClient();
const roomStore = useRoomStore();
const {
  createOrUpdateRoom,
  createOrUpdateMember,
  updateRoomNextCursor,
  updateMemberNextCursor,
  updateMessageNextCursor,
} = roomStore;
const { currentRoomId, roomList, name } = storeToRefs(roomStore);
const roomExists = computed(() => roomList.value.find((r) => r.id === currentRoomId.value));
roomStore.currentRoomId = typeof route.params.id === "string" ? route.params.id : null;
roomStore.roomSearchQuery = "";

const [
  room,
  { rooms, nextCursor: roomNextCursor },
  { members, nextCursor: memberNextCursor },
  { messages, nextCursor: messageNextCursor },
] = await Promise.all([
  roomStore.currentRoomId && !roomList.value.find((r) => r.id === roomStore.currentRoomId)
    ? client.query("room.readRoom", roomStore.currentRoomId)
    : null,
  client.query("room.readRooms", { cursor: null }),
  client.query("room.readMembers", { cursor: null }),
  roomStore.currentRoomId
    ? client.query("message.readMessages", { filter: { partitionKey: roomStore.currentRoomId }, cursor: null })
    : { messages: [], nextCursor: null },
]);

if (room) createOrUpdateRoom(room);
rooms.forEach((r) => createOrUpdateRoom(r));
members.forEach((m) => createOrUpdateMember(m));
if (roomStore.currentRoomId) roomStore.messagesMap[roomStore.currentRoomId] = messages;

updateRoomNextCursor(roomNextCursor);
updateMemberNextCursor(memberNextCursor);
updateMessageNextCursor(messageNextCursor);
</script>

<template>
  <div display="contents">
    <Head>
      <Title>{{ name }}</Title>
    </Head>
    <NuxtLayout mainClass="max-h-screen">
      <!-- Set max height here so we can hide global window scrollbar
    and show scrollbar within the chat content only for chat routes -->
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
  </div>
</template>
