<script setup lang="ts">
import { MESSAGE_MAX_LENGTH } from "#shared/services/esbabbler/constants";
import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import { getTypingMessage } from "@/services/esbabbler/message/getTypingMessage";
import { useMessageStore } from "@/store/esbabbler/message";
import { useMessageInputStore } from "@/store/esbabbler/messageInput";
import { useReplyStore } from "@/store/esbabbler/reply";
import { useRoomStore } from "@/store/esbabbler/room";
import { Extension } from "@tiptap/vue-3";

const roomStore = useRoomStore();
const { currentRoomName } = storeToRefs(roomStore);
const messageStore = useMessageStore();
const { sendMessage } = messageStore;
const { messages, typings } = storeToRefs(messageStore);
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
const messageInputStore = useMessageInputStore();
const { messageInput } = storeToRefs(messageInputStore);
const replyStore = useReplyStore();
const { rowKey } = storeToRefs(replyStore);
const reply = computed(() => messages.value.find((m) => m.rowKey === rowKey.value));
const uploadFiles = useUploadFiles();
</script>

<template>
  <EsbabblerModelMessageForwardRoomDialog />
  <EsbabblerModelMessageFileDropzoneBackground />
  <div w-full>
    <EsbabblerModelMessageReplyHeader v-if="reply" :user-id="reply.userId" @close="rowKey = ''" />
    <RichTextEditor
      v-model="messageInput"
      :placeholder="`Message ${currentRoomName}`"
      :limit="MESSAGE_MAX_LENGTH"
      :extensions="[keyboardExtension, mentionExtension]"
      :card-props="reply ? { class: 'rd-t-none' } : undefined"
      @paste="(_editor, files) => uploadFiles(files)"
    >
      <template #prepend-inner-header>
        <EsbabblerModelMessageFileInputContainer />
      </template>
      <template #prepend-footer>
        <RichTextEditorCustomUploadFileButton @upload-file="uploadFiles" />
      </template>
      <template #append-footer="editorProps">
        <RichTextEditorCustomSendMessageButton :="editorProps" />
      </template>
      <template #prepend-outer-footer>
        <div class="text-sm">{{ typingMessage }}&nbsp;</div>
      </template>
    </RichTextEditor>
  </div>
</template>
