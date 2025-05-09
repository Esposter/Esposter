<script setup lang="ts">
import { MESSAGE_MAX_LENGTH } from "#shared/services/esbabbler/constants";
import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import { getTypingMessage } from "@/services/esbabbler/getTypingMessage";
import { useEsbabblerStore } from "@/store/esbabbler";
import { useMessageStore } from "@/store/esbabbler/message";
import { useMessageInputStore } from "@/store/esbabbler/messageInput";
import { useRoomStore } from "@/store/esbabbler/room";
import { Extension } from "@tiptap/vue-3";

const esbabblerStore = useEsbabblerStore();
const { userMap } = storeToRefs(esbabblerStore);
const roomStore = useRoomStore();
const { currentRoom } = storeToRefs(roomStore);
const placeholder = computed(() => {
  if (!currentRoom.value) return "";
  const user = userMap.value.get(currentRoom.value.userId);
  return user ? `Message ${user.name}'s Room` : "";
});
const messageStore = useMessageStore();
const { sendMessage } = messageStore;
const { messages, typings } = storeToRefs(messageStore);
const typingMessage = computed(() => getTypingMessage(typings.value.map(({ username }) => username)));
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
const mentionExtension = useMentionExtension();
const messageInputStore = useMessageInputStore();
const { messageInput, replyRowKey } = storeToRefs(messageInputStore);
const reply = computed(() =>
  replyRowKey.value ? messages.value.find(({ rowKey }) => rowKey === replyRowKey.value) : undefined,
);
</script>

<template>
  <EsbabblerModelMessageForwardRoomDialog />
  <EsbabblerModelMessageDropzoneBackground />
  <div w-full>
    <EsbabblerModelMessageReplyHeader v-if="reply" :user-id="reply.userId" @close="replyRowKey = undefined" />
    <RichTextEditor
      v-model="messageInput"
      :placeholder
      :limit="MESSAGE_MAX_LENGTH"
      :extensions="[keyboardExtension, mentionExtension]"
      :card-props="reply ? { class: 'rd-t-none' } : undefined"
    >
      <template #append-footer="editorProps">
        <RichTextEditorCustomSendMessageButton :="editorProps" />
      </template>
      <template #prepend-external-footer>
        <div class="text-sm">{{ typingMessage }}&nbsp;</div>
      </template>
    </RichTextEditor>
  </div>
</template>
