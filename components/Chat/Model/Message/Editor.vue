<script setup lang="ts">
import type { MessageEntity } from "@/models/azure/message";
import { mentionExtension } from "@/services/message/mentionExtension";
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
const { message } = toRefs(props);
const editedMessageHtml = ref(message.value.message);

const { $client } = useNuxtApp();
const { info, infoOpacity10 } = useColors();
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const { updateMessage } = useMessageStore();
const onUpdateMessage = async () => {
  try {
    if (!currentRoomId.value || editedMessageHtml.value === message.value.message) return;
    if (!editedMessageHtml.value) {
      emit("update:delete-mode", true);
      return;
    }

    const updatedMessage = await $client.message.updateMessage.mutate({
      partitionKey: message.value.partitionKey,
      rowKey: message.value.rowKey,
      message: editedMessageHtml.value,
    });
    if (updatedMessage) updateMessage(updatedMessage);
  } finally {
    emit("update:update-mode", false);
    editedMessageHtml.value = message.value.message;
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
    v-model="editedMessageHtml"
    placeholder="Edit message"
    :max-length="MESSAGE_MAX_LENGTH"
    :extensions="[keyboardExtension, mentionExtension]"
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

<style scoped lang="scss">
:deep(.ProseMirror) {
  height: auto;
  max-height: 15rem;
}

:deep(.mention) {
  color: v-bind(info);
  background-color: v-bind(infoOpacity10);
  border-radius: 0.25rem;
}
</style>
