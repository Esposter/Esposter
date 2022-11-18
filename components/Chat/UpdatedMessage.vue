<script setup lang="ts">
import type { MessageEntity } from "@/services/azure/types";
import { useMessageStore } from "@/store/useMessageStore";
import { useRoomStore } from "@/store/useRoomStore";
import { storeToRefs } from "pinia";

interface UpdatedMessageProps {
  message: MessageEntity;
  updateDeleteMode: (value: true) => void;
}

const props = defineProps<UpdatedMessageProps>();
const emit = defineEmits<{ (event: "update:update-mode", value: false): void }>();
const { message, updateDeleteMode } = $(toRefs(props));
let editedMessage = $ref(message.message);

const { $client } = useNuxtApp();
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const { updateMessage } = useMessageStore();
const onUpdateMessage = async () => {
  try {
    if (!currentRoomId || editedMessage === message.message) return;
    if (!editedMessage) {
      updateDeleteMode(true);
      return;
    }

    const updatedMessage = await $client.message.updateMessage.mutate({
      partitionKey: message.partitionKey,
      rowKey: message.rowKey,
      message: editedMessage,
    });
    if (updatedMessage) updateMessage(updatedMessage);
  } finally {
    emit("update:update-mode", false);
    editedMessage = message.message;
  }
};
</script>

<template>
  <v-text-field
    density="compact"
    variant="solo"
    hide-details
    autofocus
    :model-value="editedMessage"
    @update:model-value="(value) => (editedMessage = value)"
    @keydown.enter="onUpdateMessage"
    @keydown.esc="emit('update:update-mode', false)"
  />
  <span text="3">
    escape to
    <span class="text-info underline" cursor="pointer" @click="emit('update:update-mode', false)">cancel</span> • enter
    to
    <span class="text-info underline" cursor="pointer" @click="onUpdateMessage">save</span>
  </span>
</template>
