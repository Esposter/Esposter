<script setup lang="ts">
import type { StyledDialogActivatorSlotProps } from "@/components/Styled/Dialog.vue";
import type { MessageEntity } from "@esposter/db-schema";

import { useColorsStore } from "@/store/colors";
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
const colorsStore = useColorsStore();
const { text } = storeToRefs(colorsStore);
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
    <div class="custom-border" rd-lg shadow-md mx-4 py-2>
      <slot name="messagePreview" />
    </div>
  </StyledDeleteFormDialog>
</template>
<!-- @TODO: https://github.com/vuejs/core/issues/7312 -->
<style scoped>
.custom-border {
  border: var(--border-width) var(--border-style) v-bind(text);
}
</style>
