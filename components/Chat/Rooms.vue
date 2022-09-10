<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";
import { storeToRefs } from "pinia";

const client = useClient();
const roomStore = useRoomStore();
const { pushRoomList, updateRoomListNextCursor, initialiseRoomList } = roomStore;
const { currentRoomId, rooms, roomListNextCursor } = storeToRefs(roomStore);
const hasMore = computed(() => Boolean(roomListNextCursor.value));
const fetchMoreRooms = async (finishLoading: () => void) => {
  const { rooms, nextCursor } = await client.query("room.readRooms", { cursor: roomListNextCursor.value });
  pushRoomList(rooms);
  updateRoomListNextCursor(nextCursor);
  finishLoading();
};

onMounted(async () => {
  const [room, { rooms, nextCursor }] = await Promise.all([
    currentRoomId.value ? client.query("room.readRoom", currentRoomId.value) : null,
    client.query("room.readRooms", { cursor: null }),
  ]);

  if (room) rooms.push(room);
  initialiseRoomList(rooms);
  updateRoomListNextCursor(nextCursor);
});
</script>

<template>
  <ChatModelRoomList :rooms="rooms" :hasMore="hasMore" :fetchMoreRooms="fetchMoreRooms">
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
