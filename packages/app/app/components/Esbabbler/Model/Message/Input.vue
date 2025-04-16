<script setup lang="ts">
import { MESSAGE_MAX_LENGTH } from "#shared/services/esbabbler/constants";
import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import { getTypingMessage } from "@/services/esbabbler/getTypingMessage";
import { useMessageStore } from "@/store/esbabbler/message";
import { useMessageInputStore } from "@/store/esbabbler/messageInput";
import { useRoomStore } from "@/store/esbabbler/room";
import { Extension } from "@tiptap/vue-3";

const roomStore = useRoomStore();
const { creatorMap, currentRoom } = storeToRefs(roomStore);
const placeholder = computed(() => {
  if (!currentRoom.value) return "";
  const creator = creatorMap.value.get(currentRoom.value.userId);
  return creator ? `Message ${creator.name}'s Room` : "";
});
const messageInputStore = useMessageInputStore();
const { messageInput, reply } = storeToRefs(messageInputStore);
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
const mentionExtension = useMentionExtension();
</script>

<template>
  <div w-full>
    <EsbabblerModelMessageReplyHeader v-if="reply" :user-id="reply.userId" @close="reply = undefined" />
    <RichTextEditor
      v-model="messageInput"
      :placeholder
      :limit="MESSAGE_MAX_LENGTH"
      :extensions="[keyboardExtension, mentionExtension]"
      :card-attrs="reply ? { 'rd-t-0': '' } : undefined"
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
