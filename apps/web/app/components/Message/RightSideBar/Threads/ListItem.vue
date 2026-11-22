<script setup lang="ts">
import type { ClientThread } from "#src/models/message/ClientThread";

import { pluralize } from "#shared/util/text/pluralize";
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { useThreadFollowStore } from "#src/store/message/threadFollow";
import { MessageType } from "@esposter/db-schema";

interface Props {
  thread: ClientThread;
}

const { thread } = defineProps<Props>();
const creator = useCreator(() => thread);
const openThread = useOpenThread();
const threadFollowStore = useThreadFollowStore();
const { unfollowThread } = threadFollowStore;
</script>

<!-- One thread as a row that opens it: who started it and what they said, how much and how lately it has been answered,
     and the chevron of somewhere to go. Unfollowing sits beside the row rather than inside it, as a list row's actions do -->
<template>
  <div v-if="creator" role="listitem" pr-2 flex items-center>
    <button type="button" ui-item flex-1 min-w-0 @click="openThread(thread.roomId, thread.id)">
      <UiItemContent :title="creator.name">
        <template #mark>
          <UiAvatar :image="creator.image" :name="creator.name" />
        </template>
        <template #title>
          <span flex flex-col min-w-0>
            <span text-muted flex gap-1 min-w-0 items-center>
              <span text-heading-color shrink-0>{{ creator.name }}</span>
              <MessageModelMessageAppUserBadge v-if="thread.type === MessageType.Webhook" />
              <MessageModelMessageSnippet :message="thread">
                <span italic>Attachment</span>
              </MessageModelMessageSnippet>
            </span>
            <span text-sm text-muted>
              {{ thread.replyCount }} {{ pluralize("reply", thread.replyCount, "replies") }}
              <template v-if="thread.lastReplyAt"> · <NuxtTime :datetime="thread.lastReplyAt" relative /> </template>
            </span>
          </span>
        </template>
        <template #append>
          <UiIcon :meaning="UiIconMeaning.Disclosure" text-muted shrink-0 />
        </template>
      </UiItemContent>
    </button>
    <UiIconButton
      label="Unfollow thread"
      :meaning="UiIconMeaning.NotificationsOff"
      :variant="UiButtonVariant.Quiet"
      @click="unfollowThread(thread.roomId, thread.id)"
    />
  </div>
</template>
