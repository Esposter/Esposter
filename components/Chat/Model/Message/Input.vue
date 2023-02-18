<script setup lang="ts">
import { useMessageInputStore } from "@/store/chat/useMessageInputStore";
import { useMessageStore } from "@/store/chat/useMessageStore";

const messageInputStore = useMessageInputStore();
const { messageInput } = storeToRefs(messageInputStore);
const messageStore = useMessageStore();
const { sendMessage } = messageStore;
</script>

<template>
  <RichTextEditor
    v-model="messageInput"
    w="full"
    placeholder="Aa"
    :max-length="MESSAGE_MAX_LENGTH"
    :on-enter="
      ({ editor }) => {
        sendMessage(editor.getText());
        return editor.commands.clearContent();
      }
    "
  >
    <template #append-menu="{ editor }">
      <RichTextEditorCustomEmojiPickerButton :editor="editor" tooltip="Emoji" />
    </template>
  </RichTextEditor>
</template>

<style scoped lang="scss">
:deep(.ProseMirror) {
  height: auto;
}
</style>
