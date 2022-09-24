<script setup lang="ts">
import type { DeleteMessageInput } from "@/server/trpc/message";
import type { MessageEntity } from "@/services/azure/types";
import { useMessageStore } from "@/store/useMessageStore";

interface DeleteMessageDialogProps {
  message: MessageEntity;
}

const props = defineProps<DeleteMessageDialogProps>();
const message = toRef(props, "message");
const client = useClient();
const { deleteMessage } = useMessageStore();
const isDeleteMode = ref(false);
const onDeleteMessage = async () => {
  try {
    const deleteMessageInput: DeleteMessageInput = {
      partitionKey: message.value.partitionKey,
      rowKey: message.value.rowKey,
    };
    const result = await client.mutation("message.deleteMessage", deleteMessageInput);
    if (result) deleteMessage(deleteMessageInput);
  } finally {
    isDeleteMode.value = false;
  }
};
</script>

<template>
  <slot :is-delete-mode="isDeleteMode" :update-delete-mode="(value: true) => isDeleteMode = value" />
  <v-dialog v-model="isDeleteMode" max-width="500">
    <v-card title="Delete Message" text="Are you sure you want to delete this message?">
      <div m="x-4" rd="2" b="1">
        <slot name="messagePreview" />
      </div>
      <v-card-actions>
        <v-spacer />
        <v-btn p="x-6!" text="3" @click="isDeleteMode = false">Cancel</v-btn>
        <v-btn p="x-6!" text="3" variant="flat" color="error" @click="onDeleteMessage">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
