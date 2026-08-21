<script setup lang="ts">
import type { MessageEntity } from "@esposter/db-schema";

import { useDataStore } from "@/store/message/data";
import { MESSAGE_MAX_LENGTH } from "@esposter/db-schema";
import { Extension } from "@tiptap/vue-3";

interface MessageEditorProps {
  message: MessageEntity;
}

const { message } = defineProps<MessageEditorProps>();
const emit = defineEmits<{
  "update:delete-mode": [value: true];
  "update:update-mode": [value: false];
}>();
const dataStore = useDataStore();
const { updateMessage } = dataStore;
const editedMessageHtml = ref(
  useMessageHtml(
    () => message.message,
    () => message.partitionKey,
  ).value,
);
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
</script>

<template>
  <RichTextEditor
    v-model="editedMessageHtml"
    autofocus="end"
    placeholder="Edit message"
    :extensions="[keyboardExtension, mentionExtension]"
    :limit="MESSAGE_MAX_LENGTH"
    @keydown.esc="emit('update:update-mode', false)"
  >
    <template #append-footer="{ editor }">
      <v-btn size="small" text="Cancel" variant="outlined" @click="emit('update:update-mode', false)" />
      <StyledButton v-if="editor" ml-2 :button-props="{ size: 'small', text: 'Save' }" @click="saveMessage(editor)" />
    </template>
  </RichTextEditor>
</template>
