<script setup lang="ts">
import { useMemberStore } from "@/store/useMemberStore";
import { useMessageStore } from "@/store/useMessageStore";
import { useRoomStore } from "@/store/useRoomStore";
import { uuidValidateV4 } from "@/util";
import { storeToRefs } from "pinia";

useHead({ titleTemplate: (title) => `Esbabbler | ${title}` });

const route = useRoute();
const client = useClient();
const roomStore = useRoomStore();
const { initialiseRoomList, updateRoomListNextCursor } = roomStore;
const { initialiseMembers, updateMemberNextCursor } = useMemberStore();
const { initialiseMessages, updateMessageNextCursor } = useMessageStore();
const { currentRoomId, roomList, roomName } = storeToRefs(roomStore);
const roomExists = computed(() => roomList.value.find((r) => r.id === currentRoomId.value));
roomStore.currentRoomId =
  typeof route.params.id === "string" && uuidValidateV4(route.params.id) ? route.params.id : null;
roomStore.roomSearchQuery = "";

const [
  room,
  { rooms, nextCursor: roomNextCursor },
  { members, nextCursor: memberNextCursor },
  { messages, nextCursor: messageNextCursor },
] = await Promise.all([
  currentRoomId.value && !roomExists.value ? client.query("room.readRoom", currentRoomId.value) : null,
  client.query("room.readRooms", { cursor: null }),
  client.query("room.readMembers", { cursor: null }),
  currentRoomId.value
    ? client.query("message.readMessages", { filter: { partitionKey: currentRoomId.value }, cursor: null })
    : { messages: [], nextCursor: null },
]);

if (room) rooms.push(room);
initialiseRoomList(rooms);
updateRoomListNextCursor(roomNextCursor);

initialiseMembers(members);
updateMemberNextCursor(memberNextCursor);

initialiseMessages(messages);
updateMessageNextCursor(messageNextCursor);
</script>

<template>
  <div display="contents">
    <Head>
      <Title>{{ roomName }}</Title>
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
