<script setup lang="ts">
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { useLayoutStore } from "#src/store/layout";
import { useRoomStore } from "#src/store/message/room/index";
import { useThreadFollowStore } from "#src/store/message/threadFollow";

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
  <MessageRightSideBarPane title="Followed Threads" is-body-bare @close="isRightDrawerOpen = false">
    <!-- Each row pads itself, so the rows sit in a plain list that takes neither the body's padding nor its gap -->
    <div aria-label="Followed threads" role="list" p-1 flex flex-col>
      <MessageRightSideBarThreadsListItem v-for="thread of followedThreads" :key="thread.id" :thread />
    </div>
    <template v-if="followedThreads.length === 0">
      <UiErrorState v-if="error" :error @retry="refresh()" />
      <div v-else-if="isPending" aria-busy="true">
        <MessageModelMessageListSkeletonItem v-for="i in 3" :key="i" p-4 />
      </div>
      <UiEmptyState
        v-else
        description="Follow a thread with the bell in its header to keep it here and be told of its replies."
        :meaning="UiIconMeaning.Comment"
        title="No followed threads"
      />
    </template>
  </MessageRightSideBarPane>
</template>
