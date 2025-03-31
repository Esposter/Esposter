<script setup lang="ts">
import { MESSAGE_MAX_LENGTH } from "#shared/services/esbabbler/constants";
import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import { getTypingMessage } from "@/services/esbabbler/getTypingMessage";
import { mentionExtension } from "@/services/esbabbler/mentionExtension";
import { useMessageStore } from "@/store/esbabbler/message";
import { useMessageInputStore } from "@/store/esbabbler/messageInput";
import { Extension } from "@tiptap/vue-3";

const messageInputStore = useMessageInputStore();
const { messageInput } = storeToRefs(messageInputStore);
const messageStore = useMessageStore();
const { sendMessage } = messageStore;
const { typingList } = storeToRefs(messageStore);
const typingMessage = computed(() => getTypingMessage(typingList.value.map(({ username }) => username)));
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
    <template #prepend-external-footer>
      <div class="text-sm">{{ typingMessage }}&nbsp;</div>
    </template>
  </RichTextEditor>
</template>
