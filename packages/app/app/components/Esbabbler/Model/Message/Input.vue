<script setup lang="ts">
import type { CreateTypingInput } from "#shared/models/db/message/CreateTypingInput";

import { MESSAGE_MAX_LENGTH } from "#shared/services/esbabbler/constants";
import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import { authClient } from "@/services/auth/authClient";
import { mentionExtension } from "@/services/esbabbler/mentionExtension";
import { useMessageStore } from "@/store/esbabbler/message";
import { useMessageInputStore } from "@/store/esbabbler/messageInput";
import { useRoomStore } from "@/store/esbabbler/room";
import { Extension } from "@tiptap/vue-3";

const { data: session } = await authClient.useSession(useFetch);
const { $trpc } = useNuxtApp();
const messageInputStore = useMessageInputStore();
const { messageInput } = storeToRefs(messageInputStore);
const messageStore = useMessageStore();
const { sendMessage } = messageStore;
const { typingList } = storeToRefs(messageStore);
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
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
const debouncedCreateTyping = useDebounceFn(async () => {
  if (!currentRoomId.value) return;

  const user = session.value?.user;
  if (!user || typingList.value.some(({ roomId, userId }) => roomId === currentRoomId.value && userId === user.id))
    return;
  const newTyping: CreateTypingInput = { roomId: currentRoomId.value, userId: user.id, username: user.name };
  typingList.value.push(newTyping);
  await $trpc.message.createTyping.query(newTyping);
});

watch(messageInput, async () => {
  await debouncedCreateTyping();
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
