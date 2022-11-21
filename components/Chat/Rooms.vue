<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";
import { Room } from "@prisma/client";
import { storeToRefs } from "pinia";

const { $client } = useNuxtApp();
const roomStore = useRoomStore();
const { pushRoomList, updateRoomListNextCursor, initialiseRoomList } = roomStore;
const { currentRoomId, rooms, roomListNextCursor } = $(storeToRefs(roomStore));
const hasMore = $computed(() => Boolean(roomListNextCursor));
const fetchMoreRooms = async (onComplete: () => void) => {
  const { rooms, nextCursor } = await $client.room.readRooms.query({ cursor: roomListNextCursor });
  pushRoomList(rooms);
  updateRoomListNextCursor(nextCursor);
  onComplete();
};

const [roomData, { rooms: roomsData, nextCursor }] = await Promise.all([
  currentRoomId ? $client.room.readRoom.query(currentRoomId) : null,
  $client.room.readRooms.query({ cursor: null }),
]);
const initialRooms: Room[] = [];
if (roomData && !roomsData.find((r) => r.id === roomData.id)) initialRooms.push(roomData);
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
