<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";
import { storeToRefs } from "pinia";

const client = useClient();
const roomStore = useRoomStore();
const { pushRooms, updateRoomNextCursor } = roomStore;
const { roomSearchQuery, rooms, roomNextCursor } = storeToRefs(roomStore);
const active = computed(() => Boolean(roomNextCursor.value));
const fetchMoreRooms = async (finishLoading: () => void) => {
  const { rooms, nextCursor } = await client.query("room.readRooms", {
    filter: roomSearchQuery.value ? { name: roomSearchQuery.value } : undefined,
    cursor: roomNextCursor.value,
  });
  pushRooms(rooms);
  updateRoomNextCursor(nextCursor);
  finishLoading();
};
</script>

<template>
  <v-list>
    <v-list-item font="bold">
      DIRECT MESSAGES
      <template #append>
        <ChatCreateRoomButton />
      </template>
    </v-list-item>
    <ChatRoomListItem v-for="room in rooms" :key="room.id" :room="room" />
    <Waypoint :active="active" @change="fetchMoreRooms" />
  </v-list>
</template>
