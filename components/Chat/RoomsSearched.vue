<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";
import { MESSAGES_PATH } from "@/util/constants.common";
import { storeToRefs } from "pinia";

const emit = defineEmits<{ (event: "update:room"): void }>();
const { $client } = useNuxtApp();
const roomStore = useRoomStore();
const { pushRoomListSearched, updateRoomListSearchedNextCursor } = roomStore;
const { roomSearchQuery, roomsSearched, roomListSearchedNextCursor } = $(storeToRefs(roomStore));
const hasMore = $computed(() => Boolean(roomListSearchedNextCursor));
const fetchMoreRooms = async (onComplete: () => void) => {
  try {
    const { rooms, nextCursor } = await $client.room.readRooms.query({
      filter: roomSearchQuery ? { name: roomSearchQuery } : undefined,
      cursor: roomListSearchedNextCursor,
    });
    pushRoomListSearched(rooms);
    updateRoomListSearchedNextCursor(nextCursor);
  } finally {
    onComplete();
  }
};
</script>

<template>
  <v-list>
    <InvisibleNuxtLink
      v-for="room in roomsSearched"
      :key="room.id"
      :to="MESSAGES_PATH(room.id)"
      @click="emit('update:room')"
    >
      <v-list-item :title="room.name" :value="room.id">
        <template #prepend>
          <v-avatar v-if="room.image">
            <v-img :src="room.image" :alt="room.name" />
          </v-avatar>
          <DefaultAvatar v-else :name="room.name" />
        </template>
      </v-list-item>
    </InvisibleNuxtLink>
    <VWaypoint :active="hasMore" @change="fetchMoreRooms" />
  </v-list>
</template>
