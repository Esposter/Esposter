<script setup lang="ts">
import { useDataStore } from "@/store/message/data";
import { useInputStore } from "@/store/message/input";
import { useKeyboardShortcutsDialogStore } from "@/store/message/input/keyboardShortcutsDialog";
import { useReplyStore } from "@/store/message/input/reply";
import { useSlashCommandStore } from "@/store/message/input/slashCommand";
import { useRoomStore } from "@/store/message/room";
import { checkIsEditableTarget } from "@/util/dom/checkIsEditableTarget";
import { MESSAGE_MAX_LENGTH } from "@esposter/db-schema";

const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const roomName = useRoomName(currentRoomId);
// The room's own composer — the thread pane renders its own with the thread as its target
const target = computed(() => ({ roomId: currentRoomId.value, threadRootRowKey: "" }));
const dataStore = useDataStore();
const { items } = storeToRefs(dataStore);
const { extensions, sendMessage, uploadFiles, validateInput } = await useComposer(target);
// Slash commands are the room composer's alone, so they ride on top of the shared stack rather than in it
const slashCommandExtension = useSlashCommandExtension();
const inputStore = useInputStore();
const { input } = storeToRefs(inputStore);
const replyStore = useReplyStore();
const { rowKey } = storeToRefs(replyStore);
const replyToMessage = computed(() =>
  rowKey.value ? items.value.find(({ rowKey: messageRowKey }) => messageRowKey === rowKey.value) : undefined,
);
const slashCommandStore = useSlashCommandStore();
const { pendingSlashCommand } = storeToRefs(slashCommandStore);
const keyboardShortcutsDialogStore = useKeyboardShortcutsDialogStore();
const { isOpen } = storeToRefs(keyboardShortcutsDialogStore);

useEventListener("keydown", (event: KeyboardEvent) => {
  if (checkIsEditableTarget(event.target)) return;
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
      :extensions="[...extensions, slashCommandExtension]"
      :card-props="replyToMessage ? { class: 'rd-t-none' } : undefined"
      @paste="(_editor, files) => uploadFiles(files)"
    >
      <template #prepend-inner-header>
        <MessageModelMessageFileInputContainer :target />
      </template>
      <template #prepend-footer>
        <MessageModelMessageInputActionsMenuButton />
        <RichTextEditorCustomUploadFileButton @upload-file="uploadFiles" />
      </template>
      <template #append-footer="{ editor }">
        <RichTextEditorCustomAudioRecorderButton @upload-file="uploadFiles" />
        <MessageModelMessageInputSendMessageButton
          :disabled="!validateInput(target, editor)"
          @click="
            () => {
              if (!editor) return;
              sendMessage(editor, target);
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
