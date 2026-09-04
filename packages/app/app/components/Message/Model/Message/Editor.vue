<script setup lang="ts">
import type { MessageEntity } from "@esposter/db-schema";

import { useDataStore } from "@/store/message/data";
import { MESSAGE_MAX_LENGTH } from "@esposter/db-schema";
import { Extension } from "@tiptap/vue-3";

interface Props {
  message: MessageEntity;
}

const { message } = defineProps<Props>();
const emit = defineEmits<{
  "update:delete-mode": [value: true];
  "update:update-mode": [value: false];
}>();
const dataStore = useDataStore();
const { updateMessage } = dataStore;
// The stored markup, never the rendered output: the render resolves a mention to the reader's own display name
// And a custom emoji to a read SAS that expires, so saving what was rendered would persist both
const editedMessageHtml = ref(message.message);
const saveMessage = useSaveRichTextEdit(
  editedMessageHtml,
  () => message.message,
  () =>
    updateMessage({
      message: editedMessageHtml.value,
      partitionKey: message.partitionKey,
      rowKey: message.rowKey,
    }),
  emit,
);
const keyboardExtension = new Extension({
  addKeyboardShortcuts() {
    return {
      Enter: () => {
        saveMessage(this.editor);
        return true;
      },
      Esc: () => {
        emit("update:update-mode", false);
        return true;
      },
    };
  },
});
const mentionExtension = useMentionExtension();
// Registered so the editor parses a custom emoji node back out of the stored markup — without it an edit
// Silently drops every emoji in the message
const customEmojiExtension = useCustomEmojiExtension();
</script>

<template>
  <RichTextEditor
    v-model="editedMessageHtml"
    autofocus="end"
    placeholder="Edit message"
    :extensions="[keyboardExtension, mentionExtension, customEmojiExtension]"
    :limit="MESSAGE_MAX_LENGTH"
    @keydown.esc="emit('update:update-mode', false)"
  >
    <template #append-footer="{ editor }">
      <v-btn size="small" text="Cancel" variant="outlined" @click="emit('update:update-mode', false)" />
      <StyledButton v-if="editor" ml-2 :button-props="{ size: 'small', text: 'Save' }" @click="saveMessage(editor)" />
    </template>
  </RichTextEditor>
</template>
