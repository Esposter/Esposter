<script setup lang="ts">
import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { THREAD_COMPOSER_DROP_ZONE_ATTRIBUTE } from "@/services/message/composer/constants";
import { useThreadStore } from "@/store/message/thread";

const threadStore = useThreadStore();
const { closeThread } = threadStore;
const { activeRootRowKey, isReadThreadPending, threadMessages } = storeToRefs(threadStore);
const actionItems = useThreadActionItems();
// Oldest first, so the thread reads top-down into the composer below it — the root is the earliest message in
// Its own thread, so it needs no special case to stay at the top
const sortedThreadMessages = computed(() =>
  threadMessages.value.toSorted(
    (firstMessage, secondMessage) => firstMessage.createdAt.getTime() - secondMessage.createdAt.getTime(),
  ),
);
</script>

<!-- `contents` so the marker adds no box of its own to the pane's flex column — it exists only so a file
     dropped anywhere in the pane can be resolved to this composer rather than to the room's -->
<template>
  <div :[THREAD_COMPOSER_DROP_ZONE_ATTRIBUTE]="true" contents>
    <div px-4 py-3 flex items-center justify-between>
      <span font-semibold>Thread</span>
      <div flex items-center>
        <StyledOverflowMenu v-if="activeRootRowKey" :items="actionItems" text="More" />
        <StyledTooltipIconButton
          :button-props="{ size: 'small', variant: 'text' }"
          icon="mdi-close"
          text="Close thread"
          @click="closeThread()"
        />
      </div>
    </div>
    <v-divider />
    <div v-if="isReadThreadPending" flex-1 overflow-y-auto>
      <MessageModelMessageListSkeletonItem v-for="i in DEFAULT_READ_LIMIT" :key="i" pa-4 />
    </div>
    <MessageModelMessageSearchList v-else :messages="sortedThreadMessages">
      <template #no-data>
        <v-container text-center>
          <span v-if="activeRootRowKey" op-medium-emphasis>No replies yet.</span>
          <span v-else op-medium-emphasis>No thread selected.</span>
        </v-container>
      </template>
    </MessageModelMessageSearchList>
    <!-- Keyed by the thread so opening another one starts on an empty editor: tiptap seeds its content once at
         setup, so a composer that merely rebinds would keep showing the reply typed for the previous thread -->
    <MessageRightSideBarThreadInput v-if="activeRootRowKey" :key="activeRootRowKey" />
  </div>
</template>
