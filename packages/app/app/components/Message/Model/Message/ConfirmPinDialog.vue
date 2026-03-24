<script setup lang="ts">
import type { StyledDialogActivatorSlotProps } from "@/components/Styled/Dialog.vue";
import type { MessageEntity } from "@esposter/db-schema";

import { useColorsStore } from "@/store/colors";

interface ConfirmPinDialogProps {
  message: MessageEntity;
}

defineSlots<{
  activator: (props: StyledDialogActivatorSlotProps) => VNode;
  messagePreview: () => VNode;
}>();
const { message } = defineProps<ConfirmPinDialogProps>();
const { $trpc } = useNuxtApp();
const colorsStore = useColorsStore();
const { text } = storeToRefs(colorsStore);
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
        try {
          await $trpc.message.pinMessage.mutate({ partitionKey: message.partitionKey, rowKey: message.rowKey });
        } finally {
          onComplete();
        }
      }
    "
  >
    <template #activator="activatorProps">
      <slot name="activator" :="activatorProps" />
    </template>
    <div class="custom-border" shadow-md py-2 mx-4 rd-lg>
      <slot name="messagePreview" />
    </div>
  </StyledDialog>
</template>
<!-- @TODO: https://github.com/vuejs/core/issues/7312 -->
<style scoped lang="scss">
.custom-border {
  border: $border-width-root $border-style-root v-bind(text);
}
</style>
