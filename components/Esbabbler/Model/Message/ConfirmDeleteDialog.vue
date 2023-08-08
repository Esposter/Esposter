<script setup lang="ts">
import type { StyledDialogActivatorSlotProps } from "@/components/Styled/Dialog.vue";
import type { MessageEntity } from "@/models/esbabbler/message";
import type { DeleteMessageInput } from "@/server/trpc/routers/message";
import { useMessageStore } from "@/store/esbabbler/message";

interface ConfirmDeleteMessageDialogProps {
  message: MessageEntity;
}

defineSlots<{
  default: (props: StyledDialogActivatorSlotProps) => unknown;
  messagePreview: (props: {}) => unknown;
}>();
const { message } = defineProps<ConfirmDeleteMessageDialogProps>();
const { $client } = useNuxtApp();
const { deleteMessage } = useMessageStore();
</script>

<template>
  <StyledDeleteDialog
    :card-props="{
      title: 'Delete Message',
      text: 'Are you sure you want to delete this message?',
    }"
    @delete="
      async (onComplete) => {
        try {
          const deleteMessageInput: DeleteMessageInput = {
            partitionKey: message.partitionKey,
            rowKey: message.rowKey,
          };
          await $client.message.deleteMessage.mutate(deleteMessageInput);
          deleteMessage(deleteMessageInput);
        } finally {
          onComplete();
        }
      }
    "
  >
    <template #activator="activatorProps">
      <slot :="activatorProps" />
    </template>
    <div py="2" mx="4" b="1 solid" rd="2" shadow="md">
      <slot name="messagePreview" />
    </div>
  </StyledDeleteDialog>
</template>
