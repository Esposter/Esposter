<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useRoomStore } from "@/store/useRoomStore";
import { MESSAGES_PATH } from "@/util/constants";

const emit = defineEmits<{ (event: "update:room"): void }>();
const client = useClient();
const roomStore = useRoomStore();
const { pushRoomListSearched, updateRoomListSearchedNextCursor } = roomStore;
const { roomSearchQuery, roomListSearched, roomListSearchedNextCursor } = storeToRefs(roomStore);
const hasMore = computed(() => Boolean(roomListSearchedNextCursor.value));
const fetchMoreRooms = async (finishLoading: () => void) => {
  const { rooms, nextCursor } = await client.query("room.readRooms", {
    filter: roomSearchQuery.value ? { name: roomSearchQuery.value } : undefined,
    cursor: roomListSearchedNextCursor.value,
  });
  pushRoomListSearched(rooms);
  updateRoomListSearchedNextCursor(nextCursor);
  finishLoading();
};
</script>

<template>
  <v-list>
    <InvisibleNuxtLink
      v-for="room in roomListSearched"
      :key="room.id"
      :to="MESSAGES_PATH(room.id)"
      @click="emit('update:room')"
    >
      <v-list-item :title="room.name" :value="room.id">
        <template #prepend>
          <v-avatar v-if="room.avatar">
            <v-img :src="room.avatar" :alt="room.name" />
          </v-avatar>
          <DefaultAvatar v-else :name="room.name" />
        </template>
      </v-list-item>
    </InvisibleNuxtLink>
    <VWaypoint :active="hasMore" @change="fetchMoreRooms" />
  </v-list>
</template>
