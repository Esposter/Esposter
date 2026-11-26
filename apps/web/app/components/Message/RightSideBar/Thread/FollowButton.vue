<script setup lang="ts">
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { useThreadStore } from "#src/store/message/thread";
import { useThreadFollowStore } from "#src/store/message/threadFollow";

interface Props {
  threadRootId: number;
}

const { threadRootId } = defineProps<Props>();
const threadStore = useThreadStore();
const { activeRoomId, activeThread } = storeToRefs(threadStore);
const threadFollowStore = useThreadFollowStore();
const { checkIsFollowing, followThread, unfollowThread } = threadFollowStore;
const isFollowing = computed(() => checkIsFollowing(activeRoomId.value, threadRootId));
</script>

<!-- Following is what puts a thread in Followed Threads and pushes its replies, so it sits in the pane's header in
     view, pressed while followed, rather than as a row behind the thread's menu -->
<template>
  <UiIconButton
    :aria-pressed="isFollowing"
    label="Follow thread"
    :meaning="isFollowing ? UiIconMeaning.Notifications : UiIconMeaning.NotificationsOff"
    :variant="UiButtonVariant.Quiet"
    @click="isFollowing
      ? unfollowThread(activeRoomId, threadRootId)
      : followThread(activeRoomId, threadRootId, activeThread)"
  />
</template>
