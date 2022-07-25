<script setup lang="ts">
import type { CreateMessageInput } from "@/server/trpc/message";
import { rowKey } from "@/services/azure/util";
import { useRoomStore } from "@/store/useRoomStore";
import { storeToRefs } from "pinia";

const client = useClient();
const roomStore = useRoomStore();
const { currentRoomId, updateMessageInput, createMessage } = roomStore;
const { messageInput } = storeToRefs(roomStore);
const sendMessage = async () => {
  if (!currentRoomId) return;

  const createMessageInput: CreateMessageInput = {
    partitionKey: currentRoomId,
    rowKey: await rowKey(),
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
    clearable
    hide-details
    :model-value="messageInput"
    @update:model-value="updateMessageInput"
    @keypress="
      (e) => {
        if (e.key === 'Enter') sendMessage();
      }
    "
  >
    <template #clear>
      <v-btn bg="transparent!" icon="mdi-close-circle" size="small" flat @click="updateMessageInput('')" />
    </template>
    <template #append-inner>
      <!-- Menu doesn't work yet, it will break route transitions -->
      <!-- <v-menu :close-on-content-click="false">
        <template #activator="{ props }">
          <v-btn bg="transparent!" icon="mdi-emoticon" size="small" flat :="props" />
        </template>
        <EmojiPicker :onEmojiSelect="(emoji) => updateMessageInput(message + emoji.native)" />
      </v-menu> -->
      <v-btn
        bg="transparent!"
        size="small"
        flat
        :icon="messageInput ? 'mdi-send' : 'mdi-microphone'"
        @click="sendMessage"
      />
    </template>
  </v-text-field>
</template>
