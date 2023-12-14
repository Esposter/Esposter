<script setup lang="ts">
import type { StyledDialogActivatorSlotProps } from "@/components/Styled/Dialog.vue";
import type { VBtn, VCard } from "vuetify/components";

export interface StyledCreateDialogProps {
  cardProps?: VCard["$props"];
  confirmButtonProps?: VBtn["$props"];
}

defineSlots<{
  activator: (props: StyledDialogActivatorSlotProps) => unknown;
  default: (props: {}) => unknown;
}>();
const { cardProps, confirmButtonProps } = defineProps<StyledCreateDialogProps>();
const emit = defineEmits<{ create: [onComplete: () => void] }>();
</script>

<template>
  <StyledDialog
    :card-props="cardProps"
    :confirm-button-props="{ color: 'primary', text: 'Create', ...confirmButtonProps }"
    :confirm-button-attrs="{ type: 'submit' }"
    @confirm="(onComplete) => emit('create', onComplete)"
  >
    <template #activator="activatorProps">
      <slot name="activator" :="activatorProps" />
    </template>
    <slot />
  </StyledDialog>
</template>
