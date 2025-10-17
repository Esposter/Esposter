<script setup lang="ts">
import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import { getTypingMessage } from "@/services/message/getTypingMessage";
import { useDataStore } from "@/store/message/data";
import { useInputStore } from "@/store/message/input";
import { useReplyStore } from "@/store/message/reply";
import { useRoomStore } from "@/store/message/room";
import { MESSAGE_MAX_LENGTH } from "@esposter/db-schema";
import { Extension } from "@tiptap/vue-3";

const roomStore = useRoomStore();
const { currentRoomName } = storeToRefs(roomStore);
const dataStore = useDataStore();
const { sendMessage } = dataStore;
const { items, typings } = storeToRefs(dataStore);
const typingMessage = computed(() => getTypingMessage(typings.value.map(({ username }) => username)));
const keyboardExtension = new Extension({
  addKeyboardShortcuts() {
    return {
      Enter: () => {
        getSynchronizedFunction(() => sendMessage(this.editor))();
        return true;
      },
    };
  },
});
const mentionExtension = useMentionExtension();
const inputStore = useInputStore();
const { input } = storeToRefs(inputStore);
const replyStore = useReplyStore();
const { rowKey } = storeToRefs(replyStore);
const reply = computed(() => items.value.find((m) => m.rowKey === rowKey.value));
const uploadFiles = useUploadFiles();
</script>

<template>
  <MessageModelMessageForwardRoomDialog />
  <MessageModelMessageFileDropzoneBackground />
  <div w-full>
    <MessageModelMessageReplyHeader v-if="reply?.userId" :user-id="reply.userId" @close="rowKey = ''" />
    <RichTextEditor
      v-model="input"
      :placeholder="`Message ${currentRoomName}`"
      :limit="MESSAGE_MAX_LENGTH"
      :extensions="[keyboardExtension, mentionExtension]"
      :card-props="reply ? { class: 'rd-t-none' } : undefined"
      @paste="(_editor, files) => uploadFiles(files)"
    >
      <template #prepend-inner-header>
        <MessageModelMessageFileInputContainer />
      </template>
      <template #prepend-footer>
        <RichTextEditorCustomUploadFileButton @upload-file="uploadFiles" />
      </template>
      <template #append-footer="editorProps">
        <RichTextEditorCustomSendMessageButton :="editorProps" />
      </template>
      <template #prepend-outer-footer>
        <!-- Add &nbsp; to avoid layout shift -->
        <div class="text-sm">{{ typingMessage }}&nbsp;</div>
      </template>
    </RichTextEditor>
  </div>
</template>
