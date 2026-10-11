<script setup lang="ts">
import { useInputStore } from "@/store/message/input";
import { useThreadStore } from "@/store/message/thread";

const threadStore = useThreadStore();
const { activeRoomId, activeRootRowKey } = storeToRefs(threadStore);
const target = computed(() => ({ roomId: activeRoomId.value, threadRootRowKey: activeRootRowKey.value }));
const inputStore = useInputStore();
const { threadInput, threadTarget } = storeToRefs(inputStore);
// The composer tells the input store which thread it is on, rather than the store reading it back out of the
// Thread store: that direction would put the drawer's own state behind every draft this store writes
watchImmediate(target, (newTarget) => {
  threadTarget.value = newTarget;
});
</script>

<!-- The pane's own composer: the same rich text, mentions, emoji and attachments as the room's, sending with
     the thread root as its reply target. Slash commands and the poll and scheduled-message dialogs are the
     room's alone — each is a room-level composition with its own dialog state, and a thread is a conversation
     about a message rather than a second place to run them from -->
<template>
  <div p-2>
    <MessageModelMessageInputComposer v-model="threadInput" :target placeholder="Reply...">
      <template #prepend-footer="{ uploadFiles }">
        <RichTextEditorCustomUploadFileButton @upload-file="(files) => uploadFiles(files)" />
      </template>
    </MessageModelMessageInputComposer>
  </div>
</template>
