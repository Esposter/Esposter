<script setup lang="ts">
import type { CreateMessageInput } from "@/server/trpc/routers/message";
import { useMessageInputStore } from "@/store/useMessageInputStore";
import { useMessageStore } from "@/store/useMessageStore";
import { useRoomStore } from "@/store/useRoomStore";

const { $client } = useNuxtApp();
const roomStore = useRoomStore();
const { currentRoomId } = $(storeToRefs(roomStore));
const messageInputStore = useMessageInputStore();
const { updateMessageInput } = messageInputStore;
const { messageInput } = $(storeToRefs(messageInputStore));
const { createMessage } = useMessageStore();
const sendMessage = async () => {
  if (!currentRoomId || !messageInput) return;

  const createMessageInput: CreateMessageInput = { partitionKey: currentRoomId, message: messageInput };
  updateMessageInput("");
  const newMessage = await $client.message.createMessage.mutate(createMessageInput);
  if (newMessage) createMessage(newMessage);
};
</script>

<template>
  <v-text-field
    placeholder="Aa"
    density="compact"
    hide-details
    clearable
    :model-value="messageInput"
    @update:model-value="updateMessageInput"
    @keydown.enter="sendMessage"
  >
    <template #clear>
      <v-tooltip location="top" text="Clear">
        <template #activator="{ props }">
          <v-btn icon="mdi-close-circle" size="small" bg="transparent!" :="props" @click="updateMessageInput('')" />
        </template>
      </v-tooltip>
    </template>
    <template #append-inner>
      <EmojiPicker
        :tooltip-props="{ text: 'Choose an emoji' }"
        :button-props="{ size: 'small' }"
        :button-attrs="{ bg: 'transparent!' }"
        @select="(emoji) => updateMessageInput(`${messageInput}${emoji}`)"
      />
      <v-tooltip location="top" :text="messageInput ? 'Press Enter to send' : 'Speak'">
        <template #activator="{ props }">
          <v-btn
            size="small"
            bg="transparent!"
            :icon="messageInput ? 'mdi-send' : 'mdi-microphone'"
            :="props"
            @click="sendMessage"
          />
        </template>
      </v-tooltip>
    </template>
  </v-text-field>
</template>
