<script setup lang="ts">
import type { StyledDialogActivatorSlotProps } from "@/components/Styled/Dialog.vue";
import type { VBtn, VCard } from "vuetify/components";

export interface StyledDeleteDialogProps {
  cardProps?: VCard["$props"];
  confirmButtonProps?: VBtn["$props"];
}

defineSlots<{
  activator: (props: StyledDialogActivatorSlotProps) => unknown;
  default: (props: Record<string, never>) => unknown;
}>();
const { cardProps, confirmButtonProps } = defineProps<StyledDeleteDialogProps>();
const emit = defineEmits<{ delete: [onComplete: () => void] }>();
</script>

<template>
  <StyledDialog
    :card-props
    :confirm-button-props="{ text: 'Delete', ...confirmButtonProps }"
    @submit="(_event, onComplete) => emit('delete', onComplete)"
  >
    <template #activator="activatorProps">
      <slot name="activator" :="activatorProps" />
    </template>
    <slot />
  </StyledDialog>
</template>
