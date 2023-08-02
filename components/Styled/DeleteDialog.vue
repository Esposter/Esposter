<script setup lang="ts">
import type { StyledDialogDefaultSlotProps } from "@/components/Styled/Dialog.vue";
import type { VCard } from "vuetify/components";

export interface StyledDeleteDialogProps {
  cardProps?: VCard["$props"];
}

defineSlots<{
  activator: (props: StyledDialogDefaultSlotProps) => unknown;
  default: (props: {}) => unknown;
}>();
const props = defineProps<StyledDeleteDialogProps>();
const { cardProps } = toRefs(props);
const emit = defineEmits<{ delete: [onComplete: () => void] }>();
</script>

<template>
  <StyledDialog
    :card-props="cardProps"
    confirm-button-text="Delete"
    @change="(onComplete) => emit('delete', onComplete)"
  >
    <template #activator="activatorProps">
      <slot name="activator" :="activatorProps" />
    </template>
    <slot />
  </StyledDialog>
</template>
