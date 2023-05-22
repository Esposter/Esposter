<script setup lang="ts">
import VWaypoint from "@/components/VWaypoint.vue";
import type { Room } from "@prisma/client";

interface RoomListProps {
  rooms: Room[];
  hasMore: boolean;
  // @NOTE: Ignore ts-error here until vue fixes emits types
  // @ts-ignore
  readMoreRooms: NonNullable<InstanceType<typeof VWaypoint>["$props"]["onChange"]>;
}

defineSlots<{ prepend: (props: {}) => unknown }>();
const props = defineProps<RoomListProps>();
const { rooms, hasMore, readMoreRooms } = toRefs(props);
</script>

<template>
  <v-list overflow-y="auto!">
    <slot name="prepend" />
    <EsbabblerModelRoomListItem v-for="room in rooms" :key="room.id" :room="room" />
    <VWaypoint :active="hasMore" @change="readMoreRooms" />
  </v-list>
</template>
