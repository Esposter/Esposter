<script setup lang="ts">
import type { SubmitEventPromise } from "vuetify";
import type { VBtn, VCard } from "vuetify/components";

import { mergeProps } from "vue";

export interface StyledDialogActivatorSlotProps {
  isOpen: boolean;
  updateIsOpen: (value: true) => boolean;
}

export interface StyledDialogProps {
  cardProps?: VCard["$props"];
  confirmButtonAttrs?: VBtn["$attrs"];
  confirmButtonProps?: VBtn["$props"];
}

defineSlots<{
  activator: (props: StyledDialogActivatorSlotProps) => unknown;
  default: (props: Record<string, never>) => unknown;
}>();
const { cardProps = {}, confirmButtonAttrs = {}, confirmButtonProps = {} } = defineProps<StyledDialogProps>();
const emit = defineEmits<{ submit: [event: SubmitEventPromise, onComplete: () => void] }>();
const isOpen = defineModel<boolean>({ default: false });
const isValid = ref(true);
</script>

<template>
  <v-dialog v-model="isOpen">
    <template #activator>
      <slot name="activator" :is-open :update-is-open="(value: true) => (isOpen = value)" />
    </template>
    <v-form
      v-model="isValid"
      @submit.prevent="
        emit('submit', $event, () => {
          isOpen = false;
        })
      "
    >
      <StyledCard :card-props>
        <slot />
        <v-card-actions>
          <v-spacer />
          <v-btn text-3 variant="outlined" @click="isOpen = false">Cancel</v-btn>
          <v-btn
            text-3
            type="submit"
            color="error"
            variant="outlined"
            :disabled="!isValid"
            :="mergeProps(confirmButtonProps, confirmButtonAttrs)"
          />
        </v-card-actions>
      </StyledCard>
    </v-form>
  </v-dialog>
</template>
