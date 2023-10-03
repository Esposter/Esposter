<script setup lang="ts">
import type { VBtn, VCard } from "vuetify/components";

export interface StyledDialogProps {
  cardProps?: VCard["$props"];
  confirmButtonProps: VBtn["$props"] & Required<Pick<VBtn["$props"], "text">>;
}

export interface StyledDialogActivatorSlotProps {
  isOpen: boolean;
  updateIsOpen: (value: true) => boolean;
}

defineSlots<{
  activator: (props: StyledDialogActivatorSlotProps) => unknown;
  default: (props: {}) => unknown;
}>();
const { cardProps, confirmButtonProps } = defineProps<StyledDialogProps>();
const emit = defineEmits<{ confirm: [onComplete: () => void] }>();
const isOpen = ref(false);
</script>

<template>
  <v-dialog v-model="isOpen">
    <template #activator>
      <slot name="activator" :is-open="isOpen" :update-is-open="(value: true) => (isOpen = value)" />
    </template>
    <StyledCard :="cardProps">
      <slot />
      <v-card-actions>
        <v-spacer />
        <v-btn text-3 variant="outlined" @click="isOpen = false">Cancel</v-btn>
        <v-btn
          text-3
          color="error"
          variant="outlined"
          :="confirmButtonProps"
          @click="
            emit('confirm', () => {
              isOpen = false;
            })
          "
        />
      </v-card-actions>
    </StyledCard>
  </v-dialog>
</template>
