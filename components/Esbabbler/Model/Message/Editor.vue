<script setup lang="ts">
import { type MessageEntity } from "@/models/esbabbler/message";
import { MESSAGE_MAX_LENGTH } from "@/services/esbabbler/constants";
import { mentionExtension } from "@/services/esbabbler/mentionExtension";
import { useMessageStore } from "@/store/esbabbler/message";
import { useRoomStore } from "@/store/esbabbler/room";
import { EMPTY_TEXT_REGEX } from "@/util/text/constants";
import { type Editor } from "@tiptap/core";
import { Extension } from "@tiptap/vue-3";

interface MessageEditorProps {
  message: MessageEntity;
}

const { message } = defineProps<MessageEditorProps>();
const emit = defineEmits<{
  "update:update-mode": [value: false];
  "update:delete-mode": [value: true];
}>();
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const { updateMessage } = useMessageStore();
const editedMessageHtml = ref(useRefreshMentions(message.message));
const onUpdateMessage = async (editor: Editor) => {
  try {
    if (!currentRoomId.value || editedMessageHtml.value === message.message) return;
    if (EMPTY_TEXT_REGEX.test(editor.getText())) {
      emit("update:delete-mode", true);
      return;
    }

    await updateMessage({
      partitionKey: message.partitionKey,
      rowKey: message.rowKey,
      message: editedMessageHtml.value,
    });
  } finally {
    emit("update:update-mode", false);
    editedMessageHtml.value = message.message;
  }
};
const keyboardExtension = new Extension({
  addKeyboardShortcuts() {
    return {
      Enter: () => {
        onUpdateMessage(this.editor);
        return true;
      },
      Esc: () => {
        emit("update:update-mode", false);
        return true;
      },
    };
  },
});
</script>

<template>
  <RichTextEditor
    v-model="editedMessageHtml"
    placeholder="Edit message"
    :max-length="MESSAGE_MAX_LENGTH"
    :extensions="[keyboardExtension, mentionExtension]"
  >
    <template #prepend-footer="editorProps">
      <RichTextEditorCustomEmojiPickerButton tooltip="Emoji" :="editorProps" />
    </template>
    <template #append-footer="{ editor }">
      <v-btn variant="outlined" size="small" @click="emit('update:update-mode', false)">Cancel</v-btn>
      <StyledButton
        v-if="editor"
        ml-2
        :button-props="{
          size: 'small',
        }"
        @click="onUpdateMessage(editor)"
        >Save</StyledButton
      >
    </template>
  </RichTextEditor>
</template>

<style scoped lang="scss">
:deep(.ProseMirror) {
  height: auto;
  max-height: 15rem;
}
</style>
