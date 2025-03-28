<script setup lang="ts">
import type { MessageEntity } from "#shared/models/db/message/MessageEntity";
import type { StyledDialogActivatorSlotProps } from "@/components/Styled/Dialog.vue";

interface ConfirmDeleteMessageDialogProps {
  message: MessageEntity;
}

defineSlots<{
  default: (props: StyledDialogActivatorSlotProps) => unknown;
  messagePreview: (props: Record<string, never>) => unknown;
}>();
const { message } = defineProps<ConfirmDeleteMessageDialogProps>();
const { $trpc } = useNuxtApp();
const { text } = useColors();
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
          await $trpc.message.deleteMessage.mutate({ partitionKey: message.partitionKey, rowKey: message.rowKey });
        } finally {
          onComplete();
        }
      }
    "
  >
    <template #activator="activatorProps">
      <slot :="activatorProps" />
    </template>
    <div class="custom-border" shadow-md py-2 mx-4 rd-lg>
      <slot name="messagePreview" />
    </div>
  </StyledDeleteDialog>
</template>

<style scoped lang="scss">
.custom-border {
  border: 1px $border-style-root v-bind(text);
}
</style>
