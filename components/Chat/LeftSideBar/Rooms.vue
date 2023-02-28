<script setup lang="ts">
import { useRoomStore } from "@/store/chat/room";

const roomStore = useRoomStore();
const { rooms, roomListNextCursor } = $(storeToRefs(roomStore));
const hasMore = $computed(() => Boolean(roomListNextCursor));
const readMoreRooms = await useReadRooms();
</script>

<template>
  <ChatModelRoomList :rooms="rooms" :has-more="hasMore" :read-more-rooms="readMoreRooms">
    <template #prepend>
      <v-list-item font="bold">
        Rooms
        <template #append>
          <ChatModelRoomCreateButton />
        </template>
      </v-list-item>
    </template>
  </ChatModelRoomList>
</template>
