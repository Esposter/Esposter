<script setup lang="ts">
import type { VBtn, VCard } from "vuetify/components";

import { mergeProps } from "vue";

export interface StyledDialogActivatorSlotProps {
  isOpen: boolean;
  updateIsOpen: (value: true) => boolean;
}

export interface StyledDialogProps {
  cardProps?: VCard["$props"];
  confirmButtonAttrs?: VBtn["$attrs"];
  confirmButtonProps: VBtn["$props"];
}

defineSlots<{
  activator: (props: StyledDialogActivatorSlotProps) => VNode;
  default: () => VNode;
  "prepend-actions": () => VNode;
}>();
const modelValue = defineModel<boolean>({ default: false });
const { cardProps = {}, confirmButtonAttrs = {}, confirmButtonProps } = defineProps<StyledDialogProps>();
const emit = defineEmits<{ confirm: [onComplete: () => void] }>();
const isFullScreen = ref(false);
</script>

<template>
  <v-dialog v-model="modelValue" :fullscreen="isFullScreen">
    <template #activator>
      <slot name="activator" :is-open="modelValue" :update-is-open="(value) => (modelValue = value)" />
    </template>
    <StyledCard :card-props>
      <template #append>
        <StyledToggleFullScreenDialogButton :is-full-screen-dialog="isFullScreen" @click="isFullScreen = $event" />
      </template>
      <slot />
      <v-card-actions>
        <slot name="prepend-actions" />
        <v-spacer />
        <v-btn text-3 text="Cancel" variant="outlined" @click="modelValue = false" />
        <v-btn
          v-if="confirmButtonProps.color"
          text-3
          variant="outlined"
          :="mergeProps(confirmButtonProps, confirmButtonAttrs)"
          @click="emit('confirm', () => (modelValue = false))"
        />
        <StyledButton
          v-else
          text-3
          :="mergeProps(confirmButtonProps, confirmButtonAttrs)"
          @click="emit('confirm', () => (modelValue = false))"
        />
      </v-card-actions>
    </StyledCard>
  </v-dialog>
</template>
