<script setup lang="ts">
import type { Room } from "@prisma/client";
import Waypoint from "@/components/Waypoint.vue";

interface RoomListProps {
  rooms: Room[];
  hasMore: boolean;
  fetchMoreRooms: InstanceType<typeof Waypoint>["$props"]["onChange"];
}

const props = defineProps<RoomListProps>();
const { rooms, hasMore, fetchMoreRooms } = toRefs(props);
</script>

<template>
  <v-list overflow-y="auto!">
    <slot name="prepend" />
    <ChatModelRoomListItem v-for="room in rooms" :key="room.id" :room="room" />
    <Waypoint :active="hasMore" @change="fetchMoreRooms" />
  </v-list>
</template>
