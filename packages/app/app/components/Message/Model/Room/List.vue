<script setup lang="ts">
import { useRoomStore } from "@/store/message/room";

defineSlots<{ prepend: () => VNode }>();
const roomStore = useRoomStore();
const { hasMore, rooms } = storeToRefs(roomStore);
const { readMoreRooms, readRooms } = useReadRooms();
const { isPending } = await readRooms();
</script>

<template>
  <v-list overflow-y-auto="!">
    <slot name="prepend" />
    <MessageModelRoomListItem v-for="room of rooms" :key="room.id" :room />
    <StyledWaypoint v-if="!isPending" flex justify-center :active="hasMore" @change="readMoreRooms" />
  </v-list>
</template>
