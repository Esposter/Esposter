<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";
import { storeToRefs } from "pinia";

const roomStore = useRoomStore();
const { rooms } = storeToRefs(roomStore);
const active = computed(() => Boolean(roomStore.roomListNextCursor));
const client = useClient();
const fetchMoreRooms = async (finishLoading: () => void) => {
  const { rooms, nextCursor } = await client.query("room.readRooms", {
    filter: { name: roomStore.roomSearchQuery },
    cursor: roomStore.roomListNextCursor,
  });
  roomStore.roomList.push(...rooms);
  roomStore.roomListNextCursor = nextCursor;
  finishLoading();
};
</script>

<template>
  <v-list>
    <ChatRoomListItem v-for="room in rooms" :key="room.id" :room="room" />
    <Waypoint :active="active" @change="fetchMoreRooms" />
  </v-list>
</template>
