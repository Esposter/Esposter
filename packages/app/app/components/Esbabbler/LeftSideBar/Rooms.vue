<script setup lang="ts">
import { useRoomStore } from "@/store/esbabbler/room";

const roomStore = useRoomStore();
const { hasMore, rooms } = storeToRefs(roomStore);
const readMoreRooms = await useReadRooms();
</script>

<template>
  <EsbabblerModelRoomList :rooms :has-more :read-more-rooms>
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
