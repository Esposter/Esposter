<script setup lang="ts">
import { mentionExtension } from "@/services/esbabbler/mentionExtension";
import { MESSAGE_MAX_LENGTH } from "@/shared/services/esbabbler/constants";
import { useMessageStore } from "@/store/esbabbler/message";
import { useMessageInputStore } from "@/store/esbabbler/messageInput";
import { getSynchronizedFunction } from "@/util/getSynchronizedFunction";
import { Extension } from "@tiptap/vue-3";

const messageInputStore = useMessageInputStore();
const { messageInput } = storeToRefs(messageInputStore);
const messageStore = useMessageStore();
const { sendMessage } = messageStore;
const keyboardExtension = new Extension({
  addKeyboardShortcuts() {
    return {
      Enter: () => {
        getSynchronizedFunction(() => sendMessage(this.editor))();
        return true;
      },
    };
  },
});
</script>

<template>
  <RichTextEditor
    v-model="messageInput"
    placeholder="Aa"
    :limit="MESSAGE_MAX_LENGTH"
    :extensions="[keyboardExtension, mentionExtension]"
  >
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
</style>
