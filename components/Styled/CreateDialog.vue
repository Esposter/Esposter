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
const props = defineProps<StyledCreateDialogProps>();
const { cardProps, confirmButtonProps } = toRefs(props);
const emit = defineEmits<{ create: [onComplete: () => void] }>();
</script>

<template>
  <StyledDialog
    :card-props="cardProps"
    :confirm-button-props="{ color: 'primary', text: 'Create', ...confirmButtonProps }"
    @confirm="(onComplete) => emit('create', onComplete)"
  >
    <template #activator="activatorProps">
      <slot name="activator" :="activatorProps" />
    </template>
    <slot />
  </StyledDialog>
</template>
