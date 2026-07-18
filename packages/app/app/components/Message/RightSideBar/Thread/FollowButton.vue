<script setup lang="ts">
import type { StandardMessageEntity } from "@esposter/db-schema";

import { useThreadFollowStore } from "@/store/message/threadFollow";

interface ThreadFollowButtonProps {
  roomId: string;
  threadRootRowKey: StandardMessageEntity["rowKey"];
}

const { roomId, threadRootRowKey } = defineProps<ThreadFollowButtonProps>();
const threadFollowStore = useThreadFollowStore();
const { checkIsFollowing, ensureFollowedThreadsLoaded, followThread, unfollowThread } = threadFollowStore;
const isFollowing = computed(() => checkIsFollowing(roomId, threadRootRowKey));
useQuery(() => ensureFollowedThreadsLoaded(roomId));
</script>

<template>
  <v-tooltip :text="isFollowing ? 'Unfollow thread' : 'Follow thread'" location="bottom">
    <template #activator="{ props }">
      <v-btn
        :="props"
        :color="isFollowing ? 'primary' : undefined"
        :icon="isFollowing ? 'mdi-bell' : 'mdi-bell-outline'"
        size="small"
        variant="text"
        @click="isFollowing ? unfollowThread(roomId, threadRootRowKey) : followThread(roomId, threadRootRowKey)"
      />
    </template>
  </v-tooltip>
</template>
