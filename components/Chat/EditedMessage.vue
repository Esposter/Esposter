<script setup lang="ts">
import type { MessageEntity } from "@/services/azure/types";
import { useMessageStore } from "@/store/useMessageStore";
import { useRoomStore } from "@/store/useRoomStore";
import { storeToRefs } from "pinia";

interface EditedMessageProps {
  message: MessageEntity;
  updateDeleteMode: (value: true) => void;
}

const props = defineProps<EditedMessageProps>();
const emit = defineEmits<{ (event: "update:edit-message", active: false): void }>();
const { updateDeleteMode } = props;
const message = toRef(props, "message");
const editedMessage = ref(message.value.message);

const client = useClient();
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const { updateMessage } = useMessageStore();
const onUpdateMessage = async () => {
  try {
    if (!currentRoomId.value || editedMessage.value === message.value.message) return;
    if (!editedMessage.value) {
      updateDeleteMode(true);
      return;
    }

    const updatedMessage = await client.mutation("message.updateMessage", {
      partitionKey: message.value.partitionKey,
      rowKey: message.value.rowKey,
      message: editedMessage.value,
    });
    if (updatedMessage) updateMessage(updatedMessage);
  } finally {
    emit("update:edit-message", false);
    editedMessage.value = message.value.message;
  }
};
</script>

<template>
  <!-- @NOTE We should be able to autofocus this when it appears -->
  <v-text-field
    density="compact"
    variant="solo"
    hide-details
    :model-value="editedMessage"
    @update:model-value="(value) => (editedMessage = value)"
    @keydown.enter="onUpdateMessage()"
    @keydown.esc="emit('update:edit-message', false)"
  />
  <span text="3">
    escape to
    <span class="text-info underline" cursor="pointer" @click="emit('update:edit-message', false)">cancel</span> • enter
    to
    <span class="text-info underline" cursor="pointer" @click="onUpdateMessage()">save</span>
  </span>
</template>
