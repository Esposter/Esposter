<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";
import { storeToRefs } from "pinia";

const client = useClient();
const roomStore = useRoomStore();
const { pushRoomList, updateRoomListNextCursor } = roomStore;
const { roomList, roomListNextCursor } = storeToRefs(roomStore);
const hasMore = computed(() => Boolean(roomListNextCursor.value));
const fetchMoreRooms = async (finishLoading: () => void) => {
  const { rooms, nextCursor } = await client.query("room.readRooms", { cursor: roomListNextCursor.value });
  pushRoomList(rooms);
  updateRoomListNextCursor(nextCursor);
  finishLoading();
};
</script>

<template>
  <ChatRoomList :rooms="roomList" :hasMore="hasMore" :fetchMoreRooms="fetchMoreRooms">
    <template #prepend>
      <v-list-item font="bold">
        DIRECT MESSAGES
        <template #append>
          <ChatCreateRoomButton />
        </template>
      </v-list-item>
    </template>
  </ChatRoomList>
</template>
