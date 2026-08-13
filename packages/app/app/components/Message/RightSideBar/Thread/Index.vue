<script setup lang="ts">
import { useThreadStore } from "@/store/message/thread";

const threadStore = useThreadStore();
const { closeThread } = threadStore;
const { activeRoomId, activeRootRowKey, threadMessages } = storeToRefs(threadStore);
</script>

<template>
  <div px-4 py-3 flex items-center justify-between>
    <span font-semibold>Thread</span>
    <div flex items-center>
      <MessageRightSideBarThreadFollowButton
        v-if="activeRoomId && activeRootRowKey"
        :room-id="activeRoomId"
        :thread-root-row-key="activeRootRowKey"
      />
      <StyledTooltipIconButton
        :button-props="{ size: 'small', variant: 'text' }"
        icon="mdi-close"
        text="Close thread"
        @click="closeThread()"
      />
    </div>
  </div>
  <v-divider />
  <MessageModelMessageSearchList :messages="threadMessages">
    <template #no-data>
      <v-container text-center>
        <span v-if="activeRootRowKey" op-medium-emphasis>No replies yet.</span>
        <span v-else op-medium-emphasis>No thread selected.</span>
      </v-container>
    </template>
  </MessageModelMessageSearchList>
</template>
