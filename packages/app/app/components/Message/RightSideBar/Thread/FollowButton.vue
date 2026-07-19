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
  <StyledTooltipIconButton
    :button-props="{ color: isFollowing ? 'primary' : undefined, size: 'small', variant: 'text' }"
    :icon="isFollowing ? 'mdi-bell' : 'mdi-bell-outline'"
    :text="isFollowing ? 'Unfollow thread' : 'Follow thread'"
    :tooltip-props="{ location: 'bottom' }"
    @click="isFollowing ? unfollowThread(roomId, threadRootRowKey) : followThread(roomId, threadRootRowKey)"
  />
</template>
