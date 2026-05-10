<script setup lang="ts">
import type { StyledDialogActivatorSlotProps } from "@/components/Styled/Dialog.vue";
import type { MessageEntity } from "@esposter/db-schema";

import { withFinalizerAsync } from "@esposter/shared";

interface ConfirmDeleteDialogProps {
  message: MessageEntity;
}

defineSlots<{
  activator: (props: StyledDialogActivatorSlotProps) => VNode;
  messagePreview: () => VNode;
}>();
const { message } = defineProps<ConfirmDeleteDialogProps>();
const { $trpc } = useNuxtApp();
</script>

<template>
  <StyledDeleteFormDialog
    :card-props="{
      title: 'Delete Message',
      text: 'Are you sure you want to delete this message?',
    }"
    @delete="
      async (onComplete) => {
        await withFinalizerAsync(
          () => $trpc.message.deleteMessage.mutate({ partitionKey: message.partitionKey, rowKey: message.rowKey }),
          onComplete,
        );
      }
    "
  >
    <template #activator="activatorProps">
      <slot name="activator" :="activatorProps" />
    </template>
    <div b-text b-1 rd-lg b-solid shadow-md mx-4 py-2>
      <slot name="messagePreview" />
    </div>
  </StyledDeleteFormDialog>
</template>
