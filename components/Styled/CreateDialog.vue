<script setup lang="ts">
import type { StyledDialogDefaultSlotProps } from "@/components/Styled/Dialog.vue";
import type { VCard } from "vuetify/components";

export interface StyledCreateDialogProps {
  cardProps?: VCard["$props"];
}

defineSlots<{
  activator: (props: StyledDialogDefaultSlotProps) => unknown;
  default: (props: {}) => unknown;
}>();
const props = defineProps<StyledCreateDialogProps>();
const { cardProps } = toRefs(props);
const emit = defineEmits<{ create: [onComplete: () => void] }>();
</script>

<template>
  <StyledDialog
    :card-props="cardProps"
    confirm-button-text="Create"
    @change="(onComplete) => emit('create', onComplete)"
  >
    <template #activator="activatorProps">
      <slot :="activatorProps" />
    </template>
    <slot />
  </StyledDialog>
</template>
