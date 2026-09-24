<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useLayoutStore } from "@/store/layout";
import { useRoomStore } from "@/store/message/room";
import { useThreadFollowStore } from "@/store/message/threadFollow";

const layoutStore = useLayoutStore();
const { isRightDrawerOpen } = storeToRefs(layoutStore);
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const threadFollowStore = useThreadFollowStore();
const { followedThreads } = storeToRefs(threadFollowStore);
const { refetchFollowedThreads } = threadFollowStore;
const { error, isPending, refresh } = useQuery(
  () => (currentRoomId.value ? refetchFollowedThreads(currentRoomId.value) : Promise.resolve()),
  { isInlineError: true },
);
</script>

<template>
  <header px-4 py-2 flex gap-2 ui-bar items-center>
    <h2 flex-1 truncate ui-heading>Followed Threads</h2>
    <UiIconButton
      label="Close followed threads"
      :meaning="UiIconMeaning.Close"
      :variant="UiButtonVariant.Quiet"
      @click="isRightDrawerOpen = false"
    />
  </header>
  <div flex-1 of-y-auto>
    <MessageRightSideBarThreadsListItem v-for="thread of followedThreads" :key="thread.rowKey" :thread />
    <template v-if="followedThreads.length === 0">
      <UiErrorState v-if="error" :error @retry="refresh()" />
      <div v-else-if="isPending" aria-busy="true">
        <MessageModelMessageListSkeletonItem v-for="i in 3" :key="i" p-4 />
      </div>
      <UiEmptyState
        v-else
        description="Follow a thread from its menu to keep it here."
        :meaning="UiIconMeaning.Comment"
        title="No followed threads"
      />
    </template>
  </div>
</template>
