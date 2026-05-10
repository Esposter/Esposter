<script setup lang="ts">
import { useRoomStore } from "@/store/message/room";

interface MessageModelRoomListProps {
  isCollapsed?: boolean;
}

defineSlots<{ prepend: () => VNode }>();
const { isCollapsed = false } = defineProps<MessageModelRoomListProps>();
const roomStore = useRoomStore();
const { hasMore, rooms } = storeToRefs(roomStore);
const { readMoreRooms, readRooms } = await useReadRooms();
const { isPending } = await readRooms();
</script>

<template>
  <MessageModelRoomBaseList :has-more :is-collapsed :is-pending @load-more="readMoreRooms">
    <template #prepend>
      <slot name="prepend" />
    </template>
    <MessageModelRoomListItem v-for="room of rooms" :key="room.id" :room />
  </MessageModelRoomBaseList>
</template>
