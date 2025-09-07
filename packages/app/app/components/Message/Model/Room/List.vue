<script setup lang="ts">
import { useRoomStore } from "@/store/message/room";

defineSlots<{ prepend: (props: Record<string, never>) => unknown }>();
const roomStore = useRoomStore();
const { hasMore, rooms } = storeToRefs(roomStore);
const readMoreRooms = await useReadRooms();
</script>

<template>
  <v-list overflow-y-auto="!">
    <slot name="prepend" />
    <MessageModelRoomListItem v-for="room of rooms" :key="room.id" :room />
    <StyledWaypoint :active="hasMore" @change="readMoreRooms" />
  </v-list>
</template>
