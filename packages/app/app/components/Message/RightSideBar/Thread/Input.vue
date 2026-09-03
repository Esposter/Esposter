<script setup lang="ts">
import { useInputStore } from "@/store/message/input";
import { useThreadStore } from "@/store/message/thread";
import { MESSAGE_MAX_LENGTH } from "@esposter/db-schema";

const threadStore = useThreadStore();
const { activeRoomId, activeRootRowKey } = storeToRefs(threadStore);
const target = computed(() => ({ roomId: activeRoomId.value, threadRootRowKey: activeRootRowKey.value }));
const { extensions, sendComposerMessage, uploadFiles, validateInput } = await useComposer(target);
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
  <div pa-2>
    <RichTextEditor
      v-model="threadInput"
      :limit="MESSAGE_MAX_LENGTH"
      placeholder="Reply..."
      :extensions
      @paste="(_editor, files) => uploadFiles(files)"
    >
      <template #prepend-inner-header>
        <MessageModelMessageFileInputContainer :target />
      </template>
      <template #prepend-footer>
        <RichTextEditorCustomUploadFileButton @upload-file="uploadFiles" />
      </template>
      <template #append-footer="{ editor }">
        <RichTextEditorCustomAudioRecorderButton @upload-file="uploadFiles" />
        <MessageModelMessageInputSendMessageButton
          :disabled="!validateInput(target, editor)"
          @click="
            () => {
              if (!editor) return;
              sendComposerMessage(editor, target);
            }
          "
        />
      </template>
    </RichTextEditor>
  </div>
</template>
