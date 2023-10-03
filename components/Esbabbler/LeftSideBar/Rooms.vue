<script setup lang="ts">
import { useRoomStore } from "@/store/esbabbler/room";

const roomStore = useRoomStore();
const { rooms, roomListNextCursor } = storeToRefs(roomStore);
const hasMore = computed(() => Boolean(roomListNextCursor.value));
const readMoreRooms = await useReadRooms();
</script>

<template>
  <EsbabblerModelRoomList :rooms="rooms" :has-more="hasMore" :read-more-rooms="readMoreRooms">
    <template #prepend>
      <v-list-item font-bold>
        Rooms
        <template #append>
          <EsbabblerModelRoomCreateButton />
        </template>
      </v-list-item>
    </template>
  </EsbabblerModelRoomList>
</template>
