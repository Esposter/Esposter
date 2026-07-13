<script setup lang="ts">
import type { StyledDialogActivatorSlotProps } from "@/components/Styled/Dialog.vue";

export interface StyledSearchDialogProps {
  // Registered with useVHotkey to toggle the dialog, e.g. "ctrl+k"
  hotkey?: string;
  placeholder: string;
  width?: number | string;
}

defineSlots<{
  activator?: (props: StyledDialogActivatorSlotProps) => VNode;
  default: () => VNode;
}>();
const isOpen = defineModel<boolean>({ default: false });
const searchQuery = defineModel<string>("searchQuery", { required: true });
const { hotkey = "", placeholder, width = 600 } = defineProps<StyledSearchDialogProps>();

if (hotkey)
  useVHotkey(hotkey, () => {
    isOpen.value = !isOpen.value;
  });
</script>

<template>
  <slot name="activator" :is-open="isOpen" :update-is-open="(value) => (isOpen = value)" />
  <v-dialog v-model="isOpen" :width>
    <v-card>
      <v-text-field
        v-model="searchQuery"
        :placeholder
        autofocus
        clearable
        hide-details
        prepend-inner-icon="mdi-magnify"
        variant="solo"
        @click:clear="searchQuery = ''"
      />
      <slot />
    </v-card>
  </v-dialog>
</template>
