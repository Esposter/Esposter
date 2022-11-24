<script setup lang="ts">
import type { DeleteMessageInput } from "@/server/trpc/routers/message";
import type { MessageEntity } from "@/services/azure/types";
import { useMessageStore } from "@/store/useMessageStore";

interface ConfirmDeleteMessageDialogProps {
  message: MessageEntity;
}

const props = defineProps<ConfirmDeleteMessageDialogProps>();
const { message } = $(toRefs(props));
const { $client } = useNuxtApp();
const { deleteMessage } = useMessageStore();
const onDeleteMessage = async (onComplete: () => void) => {
  try {
    const deleteMessageInput: DeleteMessageInput = { partitionKey: message.partitionKey, rowKey: message.rowKey };
    const successful = await $client.message.deleteMessage.mutate(deleteMessageInput);
    if (successful) deleteMessage(deleteMessageInput);
  } finally {
    onComplete();
  }
};
</script>

<template>
  <StyledDeleteDialog
    :card-props="{
      title: 'Delete Message',
      text: 'Are you sure you want to delete this message?',
    }"
    @delete="onDeleteMessage"
  >
    <template #default="defaultProps">
      <slot :="defaultProps" />
    </template>
    <template #content>
      <div mx="4" rd="2" b="1">
        <slot name="messagePreview" />
      </div>
    </template>
  </StyledDeleteDialog>
</template>
