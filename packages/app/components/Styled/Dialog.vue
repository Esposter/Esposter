<script setup lang="ts">
import { mergeProps } from "vue";
import type { VCard } from "vuetify/components";
import { VBtn } from "vuetify/components";

export interface StyledDialogProps {
  cardProps?: VCard["$props"];
  confirmButtonProps?: VBtn["$props"];
  confirmButtonAttrs?: VBtn["$attrs"];
}

export interface StyledDialogActivatorSlotProps {
  isOpen: boolean;
  updateIsOpen: (value: true) => boolean;
}

defineSlots<{
  activator: (props: StyledDialogActivatorSlotProps) => unknown;
  default: (props: Record<string, never>) => unknown;
}>();
const { cardProps, confirmButtonProps, confirmButtonAttrs } = defineProps<StyledDialogProps>();
const emit = defineEmits<{ confirm: [onComplete: () => void] }>();
const isOpen = ref(false);
const isValid = ref(true);
</script>

<template>
  <v-dialog v-model="isOpen">
    <template #activator>
      <slot name="activator" :is-open="isOpen" :update-is-open="(value: true) => (isOpen = value)" />
    </template>
    <v-form v-model="isValid" @submit="({ preventDefault }) => preventDefault()">
      <StyledCard :card-props="cardProps">
        <slot />
        <v-card-actions>
          <v-spacer />
          <v-btn text-3 variant="outlined" @click="isOpen = false">Cancel</v-btn>
          <v-btn
            text-3
            color="error"
            variant="outlined"
            text="Confirm"
            :disabled="!isValid"
            :="mergeProps(confirmButtonProps ?? {}, confirmButtonAttrs ?? {})"
            @click="
              emit('confirm', () => {
                isOpen = false;
              })
            "
          />
        </v-card-actions>
      </StyledCard>
    </v-form>
  </v-dialog>
</template>
