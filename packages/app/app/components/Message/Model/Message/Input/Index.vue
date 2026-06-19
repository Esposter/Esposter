<script setup lang="ts">
import { useDataStore } from "@/store/message/data";
import { useInputStore } from "@/store/message/input";
import { useKeyboardShortcutsDialogStore } from "@/store/message/input/keyboardShortcutsDialog";
import { useReplyStore } from "@/store/message/input/reply";
import { useSlashCommandStore } from "@/store/message/input/slashCommand";
import { useRoomStore } from "@/store/message/room";
import { MESSAGE_MAX_LENGTH } from "@esposter/db-schema";

const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const roomName = useRoomName(currentRoomId);
const dataStore = useDataStore();
const { items } = storeToRefs(dataStore);
const { sendMessage } = dataStore;
const keyboardExtension = await useKeyboardShortcutsExtension();
const codeBlockExtension = useCodeBlockExtension();
const emojiExtension = useEmojiExtension();
const mentionExtension = useMentionExtension();
const slashCommandExtension = useSlashCommandExtension();
const inputStore = useInputStore();
const { input } = storeToRefs(inputStore);
const { validateInput } = inputStore;
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
  <MessageModelMessageInputScheduledMessageJobDialog />
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
      autofocus="end"
      :placeholder="`Message ${roomName}`"
      :limit="MESSAGE_MAX_LENGTH"
      :extensions="[keyboardExtension, codeBlockExtension, emojiExtension, mentionExtension, slashCommandExtension]"
      :card-props="replyToMessage ? { class: 'rd-t-none' } : undefined"
      @paste="(_editor, files) => uploadFiles(files)"
    >
      <template #prepend-inner-header>
        <MessageModelMessageFileInputContainer />
      </template>
      <template #prepend-footer>
        <RichTextEditorCustomUploadFileButton @upload-file="uploadFiles" />
      </template>
      <template #append-footer="{ editor }">
        <RichTextEditorCustomAudioRecorderButton @upload-file="uploadFiles" />
        <MessageModelMessageInputSendMessageButton
          :disabled="!validateInput(editor)"
          @click="
            () => {
              if (!editor) return;
              sendMessage(editor);
            }
          "
        />
      </template>
      <template #prepend-outer-footer>
        <MessageModelMessageInputFooter />
      </template>
    </RichTextEditor>
  </div>
</template>
