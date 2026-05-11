<script setup lang="ts">
import { useThreadStore } from "@/store/message/thread";

const threadStore = useThreadStore();
const { closeThread } = threadStore;
const { activeRootRowKey, threadMessages } = storeToRefs(threadStore);
</script>

<template>
  <div px-4 py-3 flex items-center justify-between>
    <span font-semibold>Thread</span>
    <v-btn icon="mdi-close" size="small" variant="text" @click="closeThread()" />
  </div>
  <v-divider />
  <MessageModelMessageSearchList :messages="threadMessages">
    <template #no-data>
      <v-container text-center>
        <span v-if="activeRootRowKey" text-medium-emphasis>No replies yet.</span>
        <span v-else text-medium-emphasis>No thread selected.</span>
      </v-container>
    </template>
  </MessageModelMessageSearchList>
</template>
