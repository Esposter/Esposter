<script setup lang="ts">
import type { MessageEntity } from "@esposter/db-schema";
import type { Editor } from "@tiptap/core";

import { getResultAsync } from "#shared/error/getResultAsync";
import { getSynchronizedFunction } from "#shared/error/getSynchronizedFunction";
import { withFinalizer } from "#shared/error/withFinalizer";
import { useDataStore } from "@/store/message/data";
import { EMPTY_TEXT_REGEX } from "@/util/text/constants";
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
const editedMessageHtml = ref(useMessageWithMentions(() => message.message).value);
const onUpdateMessage = (editor: Editor) => {
  getSynchronizedFunction(async () => {
    await withFinalizer(
      getResultAsync(async () => {
        if (editedMessageHtml.value === message.message) return;
        else if (EMPTY_TEXT_REGEX.test(editor.getText())) {
          emit("update:delete-mode", true);
          return;
        }
        await updateMessage({
          message: editedMessageHtml.value,
          partitionKey: message.partitionKey,
          rowKey: message.rowKey,
        });
      }),
      () =>
        getResultAsync(() => {
          emit("update:update-mode", false);
          editedMessageHtml.value = message.message;
        }),
    );
  })();
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
    autofocus="end"
    placeholder="Edit message"
    :extensions="[keyboardExtension, mentionExtension]"
    :limit="MESSAGE_MAX_LENGTH"
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
