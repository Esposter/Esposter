<script setup lang="ts">
import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { useRoomStore } from "@/store/message/room";

defineSlots<{ prepend: () => VNode }>();
const roomStore = useRoomStore();
const { hasMore, rooms } = storeToRefs(roomStore);
const { readMoreRooms, readRooms } = useReadRooms();
const { isPending } = await readRooms();
</script>

<template>
  <v-list>
    <slot name="prepend" />
    <template v-if="isPending">
      <MessageModelRoomSkeletonItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
    </template>
    <template v-else>
      <MessageModelRoomListItem v-for="room of rooms" :key="room.id" :room />
      <StyledWaypoint :is-active="hasMore" @change="readMoreRooms">
        <MessageModelRoomSkeletonItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
      </StyledWaypoint>
    </template>
  </v-list>
</template>
