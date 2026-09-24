<script setup lang="ts">
import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { compareCreatedAt } from "#shared/util/date/compareCreatedAt";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { THREAD_COMPOSER_DROP_ZONE_ATTRIBUTE } from "@/services/message/composer/constants";
import { useThreadStore } from "@/store/message/thread";

const threadStore = useThreadStore();
const { closeThread } = threadStore;
const { activeRootRowKey, isReadThreadPending, threadMessages } = storeToRefs(threadStore);
const actionItems = useThreadActionItems();
// Oldest first, so the thread reads top-down into the composer below it — the root is the earliest message in
// Its own thread, so it needs no special case to stay at the top
const displayThreadMessages = computed(() =>
  threadMessages.value.toSorted((firstMessage, secondMessage) => compareCreatedAt(firstMessage, secondMessage)),
);
</script>

<!-- `contents` so the marker adds no box of its own to the pane's flex column — it exists only so a file
     dropped anywhere in the pane can be resolved to this composer rather than to the room's -->
<template>
  <div :[THREAD_COMPOSER_DROP_ZONE_ATTRIBUTE]="true" contents>
    <header px-4 py-2 flex gap-2 ui-bar items-center>
      <h2 flex-1 truncate ui-heading>Thread</h2>
      <UiOverflowMenu v-if="activeRootRowKey" :items="actionItems" label="Thread actions" />
      <UiIconButton
        label="Close thread"
        :meaning="UiIconMeaning.Close"
        :variant="UiButtonVariant.Quiet"
        @click="closeThread()"
      />
    </header>
    <div v-if="isReadThreadPending" flex-1 of-y-auto>
      <MessageModelMessageListSkeletonItem v-for="i in DEFAULT_READ_LIMIT" :key="i" p-4 />
    </div>
    <MessageModelMessageSearchList v-else :messages="displayThreadMessages">
      <template #no-data>
        <UiEmptyState
          v-if="activeRootRowKey"
          description="Replies to this message land here."
          :meaning="UiIconMeaning.Reply"
          title="No replies yet"
        />
        <UiEmptyState
          v-else
          description="Open a message's thread to read and reply to it here."
          :meaning="UiIconMeaning.Comment"
          title="No thread selected"
        />
      </template>
    </MessageModelMessageSearchList>
    <!-- Keyed by the thread so opening another one starts on an empty editor: tiptap seeds its content once at
         setup, so a composer that merely rebinds would keep showing the reply typed for the previous thread -->
    <MessageRightSideBarThreadInput v-if="activeRootRowKey" :key="activeRootRowKey" />
  </div>
</template>
