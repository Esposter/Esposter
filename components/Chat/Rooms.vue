<script setup lang="ts">
import { useRoomStore } from "@/store/chat/useRoomStore";
import type { Room } from "@prisma/client";

const { $client } = useNuxtApp();
const roomStore = useRoomStore();
const { pushRoomList, updateRoomListNextCursor, initialiseRoomList } = roomStore;
const { currentRoomId, rooms, roomListNextCursor } = $(storeToRefs(roomStore));
const hasMore = $computed(() => Boolean(roomListNextCursor));
const fetchMoreRooms = async (onComplete: () => void) => {
  try {
    const { rooms, nextCursor } = await $client.room.readRooms.query({ cursor: roomListNextCursor });
    pushRoomList(rooms);
    updateRoomListNextCursor(nextCursor);
  } finally {
    onComplete();
  }
};

const [roomData, { rooms: roomsData, nextCursor }] = await Promise.all([
  currentRoomId ? $client.room.readRoom.query(currentRoomId) : null,
  $client.room.readRooms.query({ cursor: null }),
]);
const initialRooms: Room[] = [];
if (roomData && !roomsData.some((r) => r.id === roomData.id)) initialRooms.push(roomData);
initialRooms.push(...roomsData);
updateRoomListNextCursor(nextCursor);
initialiseRoomList(initialRooms);
</script>

<template>
  <ChatModelRoomList :rooms="rooms" :has-more="hasMore" :fetch-more-rooms="fetchMoreRooms">
    <template #prepend>
      <v-list-item font="bold">
        DIRECT MESSAGES
        <template #append>
          <ChatCreateRoomButton />
        </template>
      </v-list-item>
    </template>
  </ChatModelRoomList>
</template>
