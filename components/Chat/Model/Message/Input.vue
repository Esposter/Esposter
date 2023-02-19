<script setup lang="ts">
import { mentionExtension } from "@/services/message/mentionExtension";
import { useMessageInputStore } from "@/store/chat/useMessageInputStore";
import { useMessageStore } from "@/store/chat/useMessageStore";
import { Extension } from "@tiptap/vue-3";

const { info, infoOpacity10 } = useColors();
const messageInputStore = useMessageInputStore();
const { messageInputHtml, messageInputText } = storeToRefs(messageInputStore);
const messageStore = useMessageStore();
const { sendMessage } = messageStore;
const keyboardExtension = new Extension({
  addKeyboardShortcuts() {
    return {
      Enter: () => {
        sendMessage(this.editor);
        return true;
      },
    };
  },
});
</script>

<template>
  <RichTextEditor
    v-model="messageInputHtml"
    placeholder="Aa"
    :max-length="MESSAGE_MAX_LENGTH"
    :extensions="[keyboardExtension, mentionExtension]"
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
  max-height: 15rem;
}

:deep(.mention) {
  color: v-bind(info);
  background-color: v-bind(infoOpacity10);
  border-radius: 0.25rem;
}
</style>
