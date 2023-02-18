<script setup lang="ts">
import { useMessageInputStore } from "@/store/chat/useMessageInputStore";
import { useMessageStore } from "@/store/chat/useMessageStore";

const messageInputStore = useMessageInputStore();
const { messageInputHtml, messageInputText } = storeToRefs(messageInputStore);
const messageStore = useMessageStore();
const { sendMessage } = messageStore;
</script>

<template>
  <RichTextEditor
    v-model="messageInputHtml"
    w="full"
    placeholder="Aa"
    :max-length="MESSAGE_MAX_LENGTH"
    :on-enter="
      ({ editor }) => {
        sendMessage(editor);
        return true;
      }
    "
    @update:text="(value) => (messageInputText = value)"
  >
    <template #prepend-footer="editorProps">
      <RichTextEditorCustomEmojiPickerButton tooltip="Emoji" :="editorProps" />
    </template>
    <template #append-footer="editorProps">
      <RichTextEditorCustomSendMessageButton :="editorProps" />
    </template>
  </RichTextEditor>
</template>

<style scoped lang="scss">
:deep(.ProseMirror) {
  height: auto;
}
</style>
