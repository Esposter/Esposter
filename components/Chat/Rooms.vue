<script setup lang="ts">
import { Room } from "@prisma/client";
import { storeToRefs } from "pinia";
import { useRoomStore } from "@/store/useRoomStore";

const { $client } = useNuxtApp();
const roomStore = useRoomStore();
const { pushRoomList, updateRoomListNextCursor, initialiseRoomList } = roomStore;
const { currentRoomId, rooms, roomListNextCursor } = storeToRefs(roomStore);
const hasMore = computed(() => Boolean(roomListNextCursor.value));
const fetchMoreRooms = async (finishLoading: () => void) => {
  const { data } = await $client.room.readRooms.query({ cursor: roomListNextCursor.value });
  if (data.value) {
    pushRoomList(data.value.rooms);
    updateRoomListNextCursor(data.value.nextCursor);
    finishLoading();
  }
};

const [{ data: roomData }, { data: roomsData }] = await Promise.all([
  currentRoomId.value ? $client.room.readRoom.query(currentRoomId.value) : { data: { value: null } },
  $client.room.readRooms.query({ cursor: null }),
]);
const initialRooms: Room[] = [];
if (roomData.value) initialRooms.push(roomData.value);
if (roomsData.value) {
  initialRooms.push(...roomsData.value.rooms);
  updateRoomListNextCursor(roomsData.value.nextCursor);
}
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
