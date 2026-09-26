<script setup lang="ts">
import { MessageInputCommands } from "@/services/message/input/MessageInputCommands";
import { useLayoutStore } from "@/store/layout";
import { useDataStore } from "@/store/message/data";
import { useInputStore } from "@/store/message/input";
import { useReplyStore } from "@/store/message/input/reply";
import { useSlashCommandStore } from "@/store/message/input/slashCommand";
import { useRoomStore } from "@/store/message/room";
import { MESSAGE_MAX_LENGTH } from "@esposter/db-schema";

// Discord's phone app waits for a tap before it raises the keyboard over the room, where a desktop types at once
const layoutStore = useLayoutStore();
const { isTouchScreen } = storeToRefs(layoutStore);
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const roomName = useRoomName(currentRoomId);
// The room's own composer — the thread pane renders its own with the thread as its target
const target = computed(() => ({ roomId: currentRoomId.value, threadRootRowKey: "" }));
const dataStore = useDataStore();
const { items } = storeToRefs(dataStore);
const { checkIsInputValid, extensions, sendComposerMessage, uploadFiles } = await useComposer(target);
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

useCommands(MessageInputCommands);
</script>

<template>
  <MessageModelMessageForwardRoomDialog />
  <MessageModelMessageInputPollDialog />
  <MessageModelMessageInputScheduledMessageJobDialog />
  <MessageModelMessageFileDropzoneBackground />
  <div flex flex-col gap-1 w-full ui-body>
    <MessageModelMessageInputHeaderSlashCommandParameters />
    <MessageModelMessageInputHeaderReply v-if="replyToMessage" :message="replyToMessage" @close="rowKey = ''" />
    <MessageModelMessageInputSlashCommandParameters v-if="pendingSlashCommand" />
    <RichTextEditor
      v-else
      v-model="input"
      :autofocus="isTouchScreen ? false : 'end'"
      :placeholder="`Message ${roomName}`"
      :limit="MESSAGE_MAX_LENGTH"
      :extensions="[...extensions, slashCommandExtension]"
      @paste="(_editor, files) => uploadFiles(files)"
    >
      <template #prepend-inner-header>
        <MessageModelMessageFileInputContainer :target />
      </template>
      <template #prepend-footer>
        <MessageModelMessageInputActionsMenuButton @upload-file="(files) => uploadFiles(files)" />
      </template>
      <template #append-footer="{ editor }">
        <RichTextEditorCustomAudioRecorderButton @upload-file="(files) => uploadFiles(files)" />
        <MessageModelMessageInputSendMessageButton
          :disabled="!checkIsInputValid(target, editor)"
          @click="
            () => {
              if (!editor) return;
              sendComposerMessage(editor, target);
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
