<script setup lang="ts">
import { CreateMessageInput } from "@/server/trpc/room";
import { useRoomStore } from "@/store/useRoomStore";

const client = useClient();
const { messageInput, updateMessageInput, createMessage } = useRoomStore();
const message = ref(messageInput);
const updateMessage = (val: string) => {
  message.value = val;
  updateMessageInput(val);
};
const sendMessage = async () => {
  const createMessageInput: CreateMessageInput = { message: message.value };
  message.value = "";
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
    :model-value="message"
    @update:model-value="updateMessage"
    @keypress="
      (e) => {
        if (e.key === 'Enter') sendMessage();
      }
    "
  >
    <template #clear>
      <v-btn class="bg-transparent" icon="mdi-close-circle" size="small" flat @click="updateMessage('')" />
    </template>
    <template #append-inner>
      <v-btn class="bg-transparent" icon="mdi-emoticon" size="small" flat />
      <v-btn
        class="bg-transparent"
        size="small"
        flat
        :icon="messageInput ? 'mdi-send' : 'mdi-microphone'"
        @click="sendMessage"
      />
    </template>
  </v-text-field>
</template>
