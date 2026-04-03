<script setup lang="ts">
import { useRoomStore } from "@/store/message/room";

defineSlots<{ prepend: () => VNode }>();
const roomStore = useRoomStore();
const { hasMore, rooms } = storeToRefs(roomStore);
const { readMoreRooms, readRooms } = useReadRooms();
const { isPending } = await readRooms();
</script>

<template>
  <MessageModelRoomBaseList :has-more="hasMore" :is-pending="isPending" @load-more="readMoreRooms">
    <template #prepend>
      <slot name="prepend" />
    </template>
    <MessageModelRoomListItem v-for="room of rooms" :key="room.id" :room />
  </MessageModelRoomBaseList>
</template>
