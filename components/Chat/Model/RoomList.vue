<script setup lang="ts">
import type { Room } from "@prisma/client";
import VWaypoint from "@/components/VWaypoint.vue";

interface RoomListProps {
  rooms: Room[];
  hasMore: boolean;
  fetchMoreRooms: InstanceType<typeof VWaypoint>["$props"]["onChange"];
}

const props = defineProps<RoomListProps>();
const { rooms, hasMore, fetchMoreRooms } = toRefs(props);
</script>

<template>
  <v-list overflow-y="auto!">
    <slot name="prepend" />
    <ChatModelRoomListItem v-for="room in rooms" :key="room.id" :room="room" />
    <VWaypoint :active="hasMore" @change="fetchMoreRooms" />
  </v-list>
</template>
