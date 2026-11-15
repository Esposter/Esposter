<script setup lang="ts">
import type { ClientMessage } from "#src/models/message/ClientMessage";

import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { MentionExtension } from "#src/services/message/MentionExtension";
import { useDataStore } from "#src/store/message/data";
import { MESSAGE_MAX_LENGTH } from "@esposter/db-schema";
import { Extension } from "@tiptap/vue-3";

interface Props {
  message: ClientMessage;
}

const { message } = defineProps<Props>();
const emit = defineEmits<{ "update:delete-mode": [value: true]; "update:update-mode": [value: false] }>();
const dataStore = useDataStore();
const { updateMessage } = dataStore;
// The stored markup, never the rendered output: the render resolves a mention to the reader's own display name
// And a custom emoji to a presigned read url that expires, so saving what was rendered would persist both
const editedMessageHtml = ref(message.message);
const saveMessage = useSaveRichTextEdit(
  editedMessageHtml,
  () => message.message,
  () => updateMessage({ id: message.id, message: editedMessageHtml.value, roomId: message.roomId }),
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
// Registered so the editor parses a custom emoji node back out of the stored markup — without it an edit
// Silently drops every emoji in the message
const customEmojiExtension = useCustomEmojiExtension();
</script>

<template>
  <RichTextEditor
    v-model="editedMessageHtml"
    focus-position="end"
    placeholder="Edit message"
    :extensions="[keyboardExtension, MentionExtension, customEmojiExtension]"
    :limit="MESSAGE_MAX_LENGTH"
    @keydown.esc="emit('update:update-mode', false)"
  >
    <template #append-footer="{ editor }">
      <UiButton :variant="UiButtonVariant.Quiet" @click="emit('update:update-mode', false)">Cancel</UiButton>
      <UiButton v-if="editor" :variant="UiButtonVariant.Accent" @click="saveMessage(editor)">Save</UiButton>
    </template>
  </RichTextEditor>
</template>
