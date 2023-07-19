<script setup lang="ts">
import { StyledDeleteDialogDefaultSlotProps } from "@/components/Styled/DeleteDialog.vue";
import type { MessageEntity } from "@/models/esbabbler/message";
import type { DeleteMessageInput } from "@/server/trpc/routers/message";
import { useMessageStore } from "@/store/esbabbler/message";

interface ConfirmDeleteMessageDialogProps {
  message: MessageEntity;
}

defineSlots<{
  default: (props: StyledDeleteDialogDefaultSlotProps) => unknown;
  messagePreview: (props: {}) => unknown;
}>();
const props = defineProps<ConfirmDeleteMessageDialogProps>();
const { message } = toRefs(props);
const { $client } = useNuxtApp();
const { deleteMessage } = useMessageStore();
const onDeleteMessage = async (onComplete: () => void) => {
  try {
    const deleteMessageInput: DeleteMessageInput = {
      partitionKey: message.value.partitionKey,
      rowKey: message.value.rowKey,
    };
    await $client.message.deleteMessage.mutate(deleteMessageInput);
    deleteMessage(deleteMessageInput);
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
      <div py="2" mx="4" b="1 solid" rd="2" shadow="md">
        <slot name="messagePreview" />
      </div>
    </template>
  </StyledDeleteDialog>
</template>
