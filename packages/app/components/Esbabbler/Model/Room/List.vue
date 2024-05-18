<script setup lang="ts">
import StyledWaypoint from "@/components/Styled/Waypoint.vue";
import type { Room } from "@/db/schema/rooms";

interface RoomListProps {
  rooms: Room[];
  hasMore: boolean;
  readMoreRooms: NonNullable<InstanceType<typeof StyledWaypoint>["$props"]["onChange"]>;
}

defineSlots<{ prepend: (props: Record<string, never>) => unknown }>();
const { rooms, hasMore, readMoreRooms } = defineProps<RoomListProps>();
</script>

<template>
  <v-list overflow-y-auto="!">
    <slot name="prepend" />
    <EsbabblerModelRoomListItem v-for="room in rooms" :key="room.id" :room="room" />
    <StyledWaypoint :active="hasMore" @change="readMoreRooms" />
  </v-list>
</template>
