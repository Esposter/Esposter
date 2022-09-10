<script setup lang="ts">
import type { Room } from "@prisma/client";

interface RoomListProps {
  rooms: Room[];
  hasMore: boolean;
  fetchMoreRooms: () => Promise<void>;
}

const props = defineProps<RoomListProps>();
const { fetchMoreRooms } = props;
const { rooms, hasMore } = toRefs(props);
</script>

<template>
  <v-list overflow-y="auto!">
    <slot name="prepend" />
    <ChatModelRoomListItem v-for="room in rooms" :key="room.id" :room="room" />
    <Waypoint :active="hasMore" @change="fetchMoreRooms" />
  </v-list>
</template>
