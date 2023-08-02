<script setup lang="ts">
import type { VCard } from "vuetify/components";

export interface StyledDialogProps {
  cardProps?: VCard["$props"];
  confirmButtonText: string;
}

export interface StyledDialogDefaultSlotProps {
  isOpen: boolean;
  updateIsOpen: (value: true) => boolean;
}

defineSlots<{
  default: (props: StyledDialogDefaultSlotProps) => unknown;
  content: (props: {}) => unknown;
}>();
const props = defineProps<StyledDialogProps>();
const { cardProps, confirmButtonText } = toRefs(props);
const emit = defineEmits<{ change: [onComplete: () => void] }>();
const isOpen = ref(false);
</script>

<template>
  <v-dialog v-model="isOpen">
    <template #activator>
      <slot :is-open="isOpen" :update-is-open="(value: true) => (isOpen = value)" />
    </template>
    <StyledCard :="cardProps">
      <slot name="content" />
      <v-card-actions>
        <v-spacer />
        <v-btn text="3" variant="outlined" @click="isOpen = false">Cancel</v-btn>
        <v-btn
          text="3"
          color="error"
          variant="outlined"
          @click="
            emit('change', () => {
              isOpen = false;
            })
          "
        >
          {{ confirmButtonText }}
        </v-btn>
      </v-card-actions>
    </StyledCard>
  </v-dialog>
</template>
