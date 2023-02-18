<script setup lang="ts">
import type { MessageEntity } from "@/models/azure/message";
import { useMessageStore } from "@/store/chat/useMessageStore";
import { useRoomStore } from "@/store/chat/useRoomStore";
import { Extension } from "@tiptap/vue-3";

interface MessageEditorProps {
  message: MessageEntity;
}

const props = defineProps<MessageEditorProps>();
const emit = defineEmits<{
  (event: "update:update-mode", value: false): void;
  (event: "update:delete-mode", value: true): void;
}>();
const { message } = $(toRefs(props));
let editedMessage = $ref(message.message);

const { $client } = useNuxtApp();
const roomStore = useRoomStore();
const { currentRoomId } = $(storeToRefs(roomStore));
const { updateMessage } = useMessageStore();
const onUpdateMessage = async () => {
  try {
    if (!currentRoomId || editedMessage === message.message) return;
    if (!editedMessage) {
      emit("update:delete-mode", true);
      return;
    }

    const updatedMessage = await $client.message.updateMessage.mutate({
      partitionKey: message.partitionKey,
      rowKey: message.rowKey,
      message: editedMessage,
    });
    if (updatedMessage) updateMessage(updatedMessage);
  } finally {
    emit("update:update-mode", false);
    editedMessage = message.message;
  }
};
const keyboardExtension = new Extension({
  addKeyboardShortcuts() {
    return {
      Enter: () => {
        onUpdateMessage();
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
    v-model="editedMessage"
    placeholder="Edit message"
    :max-length="MESSAGE_MAX_LENGTH"
    :extensions="[keyboardExtension]"
  >
    <template #prepend-footer="editorProps">
      <RichTextEditorCustomEmojiPickerButton tooltip="Emoji" :="editorProps" />
    </template>
    <template #append-footer>
      <v-btn variant="outlined" size="small" @click="emit('update:update-mode', false)">Cancel</v-btn>
      <StyledButton ml="2" size="small" @click="onUpdateMessage">Save</StyledButton>
    </template>
  </RichTextEditor>
</template>
