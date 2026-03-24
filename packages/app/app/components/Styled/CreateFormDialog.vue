<script setup lang="ts">
import type { StyledDialogActivatorSlotProps } from "@/components/Styled/Dialog.vue";
import type { VBtn, VCard } from "vuetify/components";

export interface StyledCreateFormDialogProps {
  cardProps?: VCard["$props"];
  confirmButtonProps?: VBtn["$props"];
}

defineSlots<{
  activator: (props: StyledDialogActivatorSlotProps) => VNode;
  default: () => VNode;
}>();
const { cardProps, confirmButtonProps } = defineProps<StyledCreateFormDialogProps>();
const emit = defineEmits<{ create: [onComplete: () => void] }>();
</script>

<template>
  <StyledFormDialog
    :card-props
    :confirm-button-props="{ text: 'Create', ...confirmButtonProps }"
    @submit="(_event, onComplete) => emit('create', onComplete)"
  >
    <template #activator="activatorProps">
      <slot name="activator" :="activatorProps" />
    </template>
    <slot />
  </StyledFormDialog>
</template>
