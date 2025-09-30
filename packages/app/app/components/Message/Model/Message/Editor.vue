<script setup lang="ts">
import type { MessageEntity } from "#shared/models/db/message/MessageEntity";
import type { Editor } from "@tiptap/core";

import { MESSAGE_MAX_LENGTH } from "#shared/services/message/constants";
import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import { useDataStore } from "@/store/message/data";
import { EMPTY_TEXT_REGEX } from "@/util/text/constants";
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
const editedMessageHtml = ref(useMessageWithMentions(() => message.message).value);
const onUpdateMessage = (editor: Editor) => {
  try {
    if (editedMessageHtml.value === message.message) return;
    else if (EMPTY_TEXT_REGEX.test(editor.getText())) {
      emit("update:delete-mode", true);
      return;
    } else
      getSynchronizedFunction(async () => {
        await updateMessage({
          message: editedMessageHtml.value,
          partitionKey: message.partitionKey,
          rowKey: message.rowKey,
        });
      })();
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
const mentionExtension = useMentionExtension();
</script>

<template>
  <RichTextEditor
    v-model="editedMessageHtml"
    placeholder="Edit message"
    :limit="MESSAGE_MAX_LENGTH"
    :extensions="[keyboardExtension, mentionExtension]"
    @keydown.esc="emit('update:update-mode', false)"
  >
    <template #append-footer="{ editor }">
      <v-btn size="small" text="Cancel" variant="outlined" @click="emit('update:update-mode', false)" />
      <StyledButton
        v-if="editor"
        ml-2
        :button-props="{ size: 'small', text: 'Save' }"
        @click="onUpdateMessage(editor)"
      />
    </template>
  </RichTextEditor>
</template>
