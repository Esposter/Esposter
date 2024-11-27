<script setup lang="ts">
import type { Room } from "@/shared/db/schema/rooms";

import StyledWaypoint from "@/components/Styled/Waypoint.vue";

interface RoomListProps {
  hasMore: boolean;
  readMoreRooms: NonNullable<InstanceType<typeof StyledWaypoint>["$props"]["onChange"]>;
  rooms: Room[];
}

defineSlots<{ prepend: (props: Record<string, never>) => unknown }>();
const { hasMore, readMoreRooms, rooms } = defineProps<RoomListProps>();
</script>

<template>
  <v-list overflow-y-auto="!">
    <slot name="prepend" />
    <EsbabblerModelRoomListItem v-for="room of rooms" :key="room.id" :room />
    <StyledWaypoint :active="hasMore" @change="readMoreRooms" />
  </v-list>
</template>
