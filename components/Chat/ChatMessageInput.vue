<script setup lang="ts">
import { CreateMessageInput } from "@/server/trpc/room";
import { useRoomStore } from "@/store/useRoomStore";
import { storeToRefs } from "pinia";

const client = useClient();
const roomStore = useRoomStore();
const { updateMessageInput, createMessage } = roomStore;
const { messageInput } = storeToRefs(roomStore);
const sendMessage = async () => {
  const createMessageInput: CreateMessageInput = { message: messageInput.value };
  updateMessageInput("");
  createMessage(await client.mutation("room.createMessage", createMessageInput));
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
      <v-btn bg="transparent!" icon="mdi-emoticon" size="small" flat />
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
