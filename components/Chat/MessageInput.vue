<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { CreateMessageInput } from "@/server/trpc/message";
import { rowKey } from "@/services/azure/util";
import { useMessageInputStore } from "@/store/useMessageInputStore";
import { useMessageStore } from "@/store/useMessageStore";
import { useRoomStore } from "@/store/useRoomStore";

const client = useClient();
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const messageInputStore = useMessageInputStore();
const { updateMessageInput } = messageInputStore;
const { messageInput } = storeToRefs(messageInputStore);
const { createMessage } = useMessageStore();
const sendMessage = async () => {
  if (!currentRoomId.value || !messageInput.value) return;

  const createMessageInput: CreateMessageInput = {
    partitionKey: currentRoomId.value,
    rowKey: rowKey(),
    message: messageInput.value,
  };
  updateMessageInput("");
  const newMessage = await client.mutation("message.createMessage", createMessageInput);
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
      <!-- <v-tooltip location="top" text="Clear">
        <template #activator="{ props }"> -->
      <v-btn bg="transparent!" icon="mdi-close-circle" size="small" flat @click="updateMessageInput('')" />
      <!-- </template>
      </v-tooltip> -->
    </template>
    <template #append-inner>
      <!-- @NOTE: Menu doesn't work yet, it will break route transitions -->
      <!-- <v-menu :close-on-content-click="false">
        <template #activator="{ props }">
          <v-btn bg="transparent!" icon="mdi-emoticon" size="small" flat :="props" />
        </template>
        <EmojiPicker :onEmojiSelect="(emoji) => updateMessageInput(message + emoji.native)" />
      </v-menu> -->
      <!-- <v-tooltip location="top" :text="messageInput ? 'Press Enter to send' : 'Speak'">
        <template #activator="{ props }"> -->
      <v-btn
        bg="transparent!"
        size="small"
        flat
        :icon="messageInput ? 'mdi-send' : 'mdi-microphone'"
        @click="sendMessage"
      />
      <!-- </template>
      </v-tooltip> -->
    </template>
  </v-text-field>
</template>
