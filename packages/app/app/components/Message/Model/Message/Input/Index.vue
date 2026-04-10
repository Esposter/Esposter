<script setup lang="ts">
import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import { getTypingMessage } from "@/services/message/getTypingMessage";
import { useDataStore } from "@/store/message/data";
import { useInputStore } from "@/store/message/input";
import { useKeyboardShortcutsDialogStore } from "@/store/message/input/keyboardShortcutsDialog";
import { useSlashCommandStore } from "@/store/message/input/slashCommand";
import { useReplyStore } from "@/store/message/input/reply";
import { useRoomStore } from "@/store/message/room";
import { MESSAGE_MAX_LENGTH } from "@esposter/db-schema";
import { Extension } from "@tiptap/vue-3";

const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const roomName = useRoomName(currentRoomId);
const dataStore = useDataStore();
const { sendMessage } = dataStore;
const { typings } = storeToRefs(dataStore);
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
const codeBlockExtension = useCodeBlockExtension();
const mentionExtension = useMentionExtension();
const slashCommandExtension = useSlashCommandExtension();
const inputStore = useInputStore();
const { input } = storeToRefs(inputStore);
const replyStore = useReplyStore();
const { replyMap, rowKey } = storeToRefs(replyStore);
const reply = computed(() => (rowKey.value ? replyMap.value.get(rowKey.value) : undefined));
const uploadFiles = useUploadFiles();
const slashCommandStore = useSlashCommandStore();
const { pendingSlashCommand } = storeToRefs(slashCommandStore);
const keyboardShortcutsDialogStore = useKeyboardShortcutsDialogStore();
const { isOpen } = storeToRefs(keyboardShortcutsDialogStore);
useEventListener("keydown", (event: KeyboardEvent) => {
  if (event.shiftKey && event.key === "?") isOpen.value = true;
});
</script>

<template>
  <MessageModelMessageForwardRoomDialog />
  <MessageModelMessageInputPollDialog />
  <MessageModelMessageInputKeyboardShortcutsDialog />
  <MessageModelMessageFileDropzoneBackground />
  <div w-full>
    <MessageModelMessageInputReplyHeader v-if="reply" :reply @close="rowKey = ''" />
    <MessageModelMessageInputSlashCommandParams v-if="pendingSlashCommand" />
    <RichTextEditor
      v-else
      v-model="input"
      :placeholder="`Message ${roomName}`"
      :limit="MESSAGE_MAX_LENGTH"
      :extensions="[keyboardExtension, codeBlockExtension, mentionExtension, slashCommandExtension]"
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
        <RichTextEditorCustomVoiceRecorderButton @upload-file="uploadFiles" />
        <RichTextEditorCustomSendMessageButton :="editorProps" />
      </template>
      <template #prepend-outer-footer>
        <!-- Add &nbsp; to avoid layout shift -->
        <div class="text-sm">{{ typingMessage }}&nbsp;</div>
      </template>
    </RichTextEditor>
  </div>
</template>
