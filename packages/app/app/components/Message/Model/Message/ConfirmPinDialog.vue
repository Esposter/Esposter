<script setup lang="ts">
import type { StyledDialogActivatorSlotProps } from "@/components/Styled/Dialog.vue";
import type { MessageEntity } from "@esposter/db-schema";

import { withFinalizerAsync } from "@esposter/shared";

interface ConfirmPinDialogProps {
  message: MessageEntity;
}

defineSlots<{
  activator: (props: StyledDialogActivatorSlotProps) => VNode;
  messagePreview: () => VNode;
}>();
const { message } = defineProps<ConfirmPinDialogProps>();
const { $trpc } = useNuxtApp();
</script>

<template>
  <StyledDialog
    :card-props="{
      title: 'Pin It. Pin It Good.',
      text: 'Hey, just double-checking that you want to pin this message to the current room for posterity and greatness?',
    }"
    :confirm-button-props="{ text: 'Oh yeah. Pin it' }"
    @confirm="
      async (onComplete) => {
        await withFinalizerAsync(
          () => $trpc.message.pinMessage.mutate({ partitionKey: message.partitionKey, rowKey: message.rowKey }),
          onComplete,
        );
      }
    "
  >
    <template #activator="activatorProps">
      <slot name="activator" :="activatorProps" />
    </template>
    <div mx-4 py-2 b-1 b-text rd-lg b-solid shadow-md>
      <slot name="messagePreview" />
    </div>
  </StyledDialog>
</template>
