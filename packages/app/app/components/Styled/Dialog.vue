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
  activator: (props: StyledDialogActivatorSlotProps) => VNode;
  default: () => VNode;
}>();
const { cardProps = {}, confirmButtonAttrs = {}, confirmButtonProps = {} } = defineProps<StyledDialogProps>();
const emit = defineEmits<{ submit: [event: SubmitEventPromise, onComplete: () => void] }>();
const modelValue = defineModel<boolean>({ default: false });
const isValid = ref(true);
</script>

<template>
  <v-dialog v-model="modelValue">
    <template #activator>
      <slot name="activator" :is-open="modelValue" :update-is-open="(value) => (modelValue = value)" />
    </template>
    <v-form
      v-model="isValid"
      @submit.prevent="
        emit('submit', $event, () => {
          modelValue = false;
        })
      "
    >
      <StyledCard :card-props>
        <slot />
        <v-card-actions>
          <v-spacer />
          <v-btn text-3 text="Cancel" variant="outlined" @click="modelValue = false" />
          <v-btn
            v-if="confirmButtonProps.color"
            text-3
            type="submit"
            variant="outlined"
            :disabled="!isValid"
            :="mergeProps(confirmButtonProps, confirmButtonAttrs)"
          />
          <StyledButton
            v-else
            text-3
            type="submit"
            :disabled="!isValid"
            :="mergeProps(confirmButtonProps, confirmButtonAttrs)"
          />
        </v-card-actions>
      </StyledCard>
    </v-form>
  </v-dialog>
</template>
