<script setup lang="ts">
import { useLayoutStore } from "@/store/layout";
import { useRoomStore } from "@/store/message/room";
import { useThreadFollowStore } from "@/store/message/threadFollow";

const layoutStore = useLayoutStore();
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const threadFollowStore = useThreadFollowStore();
const { followedThreads } = storeToRefs(threadFollowStore);
const { readFollowedThreads } = threadFollowStore;
useQuery(() => (currentRoomId.value ? readFollowedThreads(currentRoomId.value) : Promise.resolve()));
</script>

<template>
  <div px-4 py-3 flex items-center justify-between>
    <span font-semibold>Followed Threads</span>
    <v-btn icon="mdi-close" size="small" variant="text" @click="layoutStore.isRightDrawerOpen = false" />
  </div>
  <v-divider />
  <div v-if="followedThreads.length > 0" flex-1 overflow-y-auto>
    <v-list>
      <MessageRightSideBarThreadsListItem v-for="thread of followedThreads" :key="thread.rowKey" :thread />
    </v-list>
  </div>
  <v-container v-else text-center>
    <span op-medium-emphasis>You aren't following any threads yet.</span>
  </v-container>
</template>
