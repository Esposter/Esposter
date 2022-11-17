<script setup lang="ts">
import type { DeleteMessageInput } from "@/server/trpc/routers/message";
import type { MessageEntity } from "@/services/azure/types";
import { useMessageStore } from "@/store/useMessageStore";

interface DeleteMessageDialogProps {
  message: MessageEntity;
}

const props = defineProps<DeleteMessageDialogProps>();
const { message } = $(toRefs(props));
const { $client } = useNuxtApp();
const { deleteMessage } = useMessageStore();
let isDeleteMode = $ref(false);
const onDeleteMessage = async () => {
  try {
    const deleteMessageInput: DeleteMessageInput = { partitionKey: message.partitionKey, rowKey: message.rowKey };
    const successful = await $client.message.deleteMessage.mutate(deleteMessageInput);
    if (successful) deleteMessage(deleteMessageInput);
  } finally {
    isDeleteMode = false;
  }
};
</script>

<template>
  <slot :is-delete-mode="isDeleteMode" :update-delete-mode="(value: true) => isDeleteMode = value" />
  <v-dialog v-model="isDeleteMode" max-width="500">
    <v-card title="Delete Message" text="Are you sure you want to delete this message?">
      <div mx="4" rd="2" b="1">
        <slot name="messagePreview" />
      </div>
      <v-card-actions>
        <v-spacer />
        <v-btn px="6!" text="3" @click="isDeleteMode = false">Cancel</v-btn>
        <v-btn px="6!" text="3" variant="flat" color="error" @click="onDeleteMessage">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
