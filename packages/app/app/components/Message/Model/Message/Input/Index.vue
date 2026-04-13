<script setup lang="ts">
import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import { authClient } from "@/services/auth/authClient";
import { useMessageStore } from "@/store/message";
import { useDataStore } from "@/store/message/data";
import { useInputStore } from "@/store/message/input";
import { useKeyboardShortcutsDialogStore } from "@/store/message/input/keyboardShortcutsDialog";
import { useReplyStore } from "@/store/message/input/reply";
import { useSlashCommandStore } from "@/store/message/input/slashCommand";
import { useRoomStore } from "@/store/message/room";
import { EMPTY_TEXT_REGEX } from "@/util/text/constants";
import { MESSAGE_MAX_LENGTH, MessageType } from "@esposter/db-schema";
import { Extension } from "@tiptap/vue-3";

const session = authClient.useSession();
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const roomName = useRoomName(currentRoomId);
const dataStore = useDataStore();
const { items } = storeToRefs(dataStore);
const { sendMessage } = dataStore;
const messageStore = useMessageStore();
const { editingRowKey } = storeToRefs(messageStore);
const keyboardExtension = new Extension({
  addKeyboardShortcuts() {
    return {
      ArrowUp: () => {
        if (!EMPTY_TEXT_REGEX.test(this.editor.getText())) return false;
        const userId = session.value.data?.user.id;
        if (!userId) return false;
        const lastOwnMessage = items.value.find(
          ({ deletedAt, type, userId: messageUserId }) =>
            !deletedAt && type === MessageType.Message && messageUserId === userId,
        );
        if (!lastOwnMessage) return false;
        editingRowKey.value = lastOwnMessage.rowKey;
        return true;
      },
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
const { rowKey } = storeToRefs(replyStore);
const replyToMessage = computed(() =>
  rowKey.value ? items.value.find(({ rowKey: messageRowKey }) => messageRowKey === rowKey.value) : undefined,
);
const uploadFiles = useUploadFiles();
const slashCommandStore = useSlashCommandStore();
const { pendingSlashCommand } = storeToRefs(slashCommandStore);
const keyboardShortcutsDialogStore = useKeyboardShortcutsDialogStore();
const { isOpen } = storeToRefs(keyboardShortcutsDialogStore);

useEventListener("keydown", (event: KeyboardEvent) => {
  const target = event.target;
  if (
    target instanceof HTMLElement &&
    (target.isContentEditable || target.tagName === "INPUT" || target.tagName === "TEXTAREA")
  )
    return;
  else if (event.shiftKey && event.key === "?") isOpen.value = true;
});
</script>

<template>
  <MessageModelMessageForwardRoomDialog />
  <MessageModelMessageInputPollDialog />
  <MessageModelMessageInputKeyboardShortcutsDialog />
  <MessageModelMessageFileDropzoneBackground />
  <div w-full>
    <MessageModelMessageInputHeaderSlashCommandParameters />
    <MessageModelMessageInputHeaderReply
      v-if="replyToMessage"
      :message="replyToMessage"
      :is-top-attached="Boolean(pendingSlashCommand)"
      @close="rowKey = ''"
    />
    <MessageModelMessageInputSlashCommandParameters v-if="pendingSlashCommand" />
    <RichTextEditor
      v-else
      v-model="input"
      :placeholder="`Message ${roomName}`"
      :limit="MESSAGE_MAX_LENGTH"
      :extensions="[keyboardExtension, codeBlockExtension, mentionExtension, slashCommandExtension]"
      :card-props="replyToMessage ? { class: 'rd-t-none' } : undefined"
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
        <MessageModelMessageInputFooter />
      </template>
    </RichTextEditor>
  </div>
</template>
