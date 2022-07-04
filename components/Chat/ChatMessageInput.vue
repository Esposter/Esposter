<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";

const { messageInput, updateMessageInput } = useRoomStore();
const message = ref(messageInput);
const updateMessage = (val: string) => {
  message.value = val;
  updateMessageInput(val);
};
const sendMessage = () => {
  message.value = "";
  updateMessageInput("");
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
